
'use client';

import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { storage, firestore, auth } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Progress } from './ui/progress';

declare global {
    interface Window {
        lamejs: any;
    }
}

const wavToMp3 = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read WAV file."));
            }
            try {
                const wavData = parseWav(event.target.result as ArrayBuffer);
                const pcmData = wavData.samples;
                
                const mp3encoder = new window.lamejs.Mp3Encoder(wavData.channels, wavData.sampleRate, 128); // 128 kbps
                const mp3Data = [];
                const sampleBlockSize = 1152; 

                for (let i = 0; i < pcmData.length; i += sampleBlockSize) {
                    const sampleChunk = pcmData.subarray(i, i + sampleBlockSize);
                    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
                    if (mp3buf.length > 0) {
                        mp3Data.push(mp3buf);
                    }
                }
                const mp3buf = mp3encoder.flush();
                if (mp3buf.length > 0) {
                    mp3Data.push(mp3buf);
                }

                const blob = new Blob(mp3Data.map(b => new Uint8Array(b)), {type: 'audio/mpeg'});
                resolve(blob);

            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsArrayBuffer(file);
    });
};


const parseWav = (wav: ArrayBuffer): { channels: number; sampleRate: number; samples: Int16Array } => {
  const view = new DataView(wav);

  const format = view.getUint16(20, true);
  if (format !== 1 && format !== 3) {
      throw new Error("Only PCM and Float32 formats are supported");
  }

  const channels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitDepth = view.getUint16(34, true);

  let dataOffset = 12;
  while (view.getUint32(dataOffset, false) !== 0x64617461) {
      dataOffset++;
      if (dataOffset > view.byteLength) {
          throw new Error("Invalid WAV file: 'data' chunk not found");
      }
  }
  const dataSize = view.getUint32(dataOffset + 4, true);
  const pcmOffset = dataOffset + 8;

  let samples;
  if (format === 1) { // 16-bit integer PCM
      if (bitDepth !== 16) throw new Error("Only 16-bit integer PCM is supported");
      samples = new Int16Array(wav, pcmOffset, dataSize / 2);
  } else { // 32-bit float PCM
      if (bitDepth !== 32) throw new Error("Only 32-bit float PCM is supported");
      const floatSamples = new Float32Array(wav, pcmOffset, dataSize / 4);
      samples = new Int16Array(floatSamples.length);
      for (let i = 0; i < floatSamples.length; i++) {
          samples[i] = floatSamples[i] * 32767;
      }
  }

  return { channels, sampleRate, samples };
};

const generateWaveformData = async (file: File): Promise<number[]> => {
    return new Promise((resolve, reject) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const reader = new FileReader();

        reader.onload = (e) => {
            if (!e.target?.result) {
                return reject(new Error("Failed to read file"));
            }
            audioContext.decodeAudioData(e.target.result as ArrayBuffer, (buffer) => {
                const rawData = buffer.getChannelData(0);
                const samples = 100; // Number of waveform points
                const blockSize = Math.floor(rawData.length / samples);
                const filteredData = [];
                for (let i = 0; i < samples; i++) {
                    const blockStart = blockSize * i;
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(rawData[blockStart + j]);
                    }
                    filteredData.push(sum / blockSize);
                }
                
                const multiplier = Math.pow(Math.max(...filteredData), -1);
                const normalizedData = filteredData.map(n => Math.round(n * multiplier * 100));
                resolve(normalizedData);
            }).catch(reject);
        };

        reader.onerror = (error) => {
            reject(error);
        };
        
        reader.readAsArrayBuffer(file);
    });
};

interface UploadFormProps {
  onUploadComplete: (trackId: string) => void;
}

export function UploadForm({ onUploadComplete }: UploadFormProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusText, setStatusText] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const acceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/wave'];
    if (file && acceptedTypes.includes(file.type)) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select an MP3 or WAV file.",
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to upload a track." });
      return;
    }

    if (!selectedFile) {
       toast({ variant: "destructive", title: "No file selected", description: "Please select an MP3 or WAV file to upload." });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      setStatusText("Generating waveform...");
      const waveform = await generateWaveformData(selectedFile);
      
      let fileToUpload: File | Blob = selectedFile;
      let finalFileName = selectedFile.name;
      
      if (selectedFile.type === 'audio/wav' || selectedFile.type === 'audio/wave') {
          setStatusText("Converting WAV to MP3...");
          finalFileName = selectedFile.name.replace(/\.(wav|wave)$/i, '.mp3');
          fileToUpload = await wavToMp3(selectedFile);
      }

      setStatusText("Uploading file...");
      const storageRef = ref(storage, `tracks/${user.uid}/${Date.now()}-${finalFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setIsProcessing(false);
          setUploadProgress(0);
          setStatusText("");
          toast({ variant: "destructive", title: "Upload Failed", description: "An error occurred while uploading your track. Please try again." });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const finalStoragePath = uploadTask.snapshot.ref.fullPath;
            const trackTitle = selectedFile.name.replace(/\.[^/.]+$/, "");

            const trackDocRef = await addDoc(collection(firestore, 'tracks'), {
              title: trackTitle,
              artist: user.displayName || 'Unknown Artist',
              audioUrl: downloadURL,
              storagePath: finalStoragePath,
              waveform: waveform,
              userId: user.uid,
              createdAt: serverTimestamp(),
              commentCount: 0,
            });

            toast({ title: "Upload Successful", description: "Your track is ready and saved to your dashboard." });
            onUploadComplete(trackDocRef.id);
          } catch (error) {
            console.error("Error creating Firestore document:", error);
            toast({ variant: "destructive", title: "Error Saving Track", description: `Your file was uploaded, but we couldn't save it.` });
          } finally {
            setIsProcessing(false);
            setStatusText("");
          }
        }
      );
    } catch (error) {
        console.error("Processing error:", error);
        setIsProcessing(false);
        setStatusText("");
        toast({
            variant: "destructive",
            title: "Could Not Process Audio",
            description: `There was an error processing the audio file. ${error instanceof Error ? error.message : ''}`,
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50 transition-colors p-4">
            <div className="flex flex-col items-center justify-center text-center">
                <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">MP3 or WAV</p>
            </div>
            <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".mp3,.wav,audio/mpeg,audio/wave" disabled={isProcessing} />
        </label>
      </div>

      {selectedFile && !isProcessing && <p className="text-sm text-center text-muted-foreground">Selected: {selectedFile.name}</p>}

      {isProcessing && (
        <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin"/>
              {statusText}
            </p>
            {(statusText === 'Uploading file...') && <Progress value={uploadProgress} />}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isProcessing || !selectedFile}>
        {isProcessing ? 'Processing...' : 'Create Session'}
      </Button>
    </form>
  );
}
