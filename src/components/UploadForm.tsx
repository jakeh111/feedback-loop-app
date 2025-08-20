
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
import lamejs from 'lamejs';

interface UploadFormProps {
  onUploadComplete: (trackId: string) => void;
}

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

const wavToMp3 = (wavFile: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        return reject(new Error("Failed to read file"));
      }
      try {
        const arrayBuffer = e.target.result as ArrayBuffer;
        const wavData = parseWav(arrayBuffer);
        const pcmData = wavData.samples;

        const mp3encoder = new lamejs.Mp3Encoder(wavData.channels, wavData.sampleRate, 128); // 128 kbps
        const mp3Data = [];
        const sampleBlockSize = 1152;

        for (let i = 0; i < pcmData.length; i += sampleBlockSize) {
            const sampleChunk = pcmData.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(new Int8Array(mp3buf));
            }
        }
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(new Int8Array(mp3buf));
        }
        
        const blob = new Blob(mp3Data, {type: 'audio/mpeg'});
        resolve(blob);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(wavFile);
  });
};

function parseWav(arrayBuffer: ArrayBuffer) {
  const view = new DataView(arrayBuffer);

  // Check RIFF header
  if (view.getUint32(0, false) !== 0x52494646) throw new Error("Not a valid RIFF file");
  if (view.getUint32(8, false) !== 0x57415645) throw new Error("Not a valid WAVE file");
  if (view.getUint32(12, false) !== 0x666d7420) throw new Error("Invalid 'fmt ' chunk");
  
  const audioFormat = view.getUint16(20, true);
  const channels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);

  if (audioFormat !== 1 && audioFormat !== 3) {
      throw new Error("Only PCM and IEEE Float formats are supported");
  }

  let dataOffset = 12;
  while (dataOffset < view.byteLength && view.getUint32(dataOffset, false) !== 0x64617461) {
      dataOffset += 8 + view.getUint32(dataOffset + 4, true);
  }
  if (dataOffset >= view.byteLength) throw new Error("Could not find 'data' chunk");
  
  const dataSize = view.getUint32(dataOffset + 4, true);
  const pcmOffset = dataOffset + 8;
  
  let samples;
  if (audioFormat === 1) { // 16-bit Integer PCM
    if (bitsPerSample !== 16) throw new Error("Only 16-bit integer PCM is supported");
    samples = new Int16Array(arrayBuffer, pcmOffset, dataSize / 2);
  } else if (audioFormat === 3) { // 32-bit Float PCM
    if (bitsPerSample !== 32) throw new Error("Only 32-bit float PCM is supported");
    const floatSamples = new Float32Array(arrayBuffer, pcmOffset, dataSize / 4);
    samples = new Int16Array(floatSamples.length);
    for(let i = 0; i < floatSamples.length; i++) {
        // Convert float from [-1.0, 1.0] to 16-bit integer [-32768, 32767]
        samples[i] = Math.max(-32768, Math.min(32767, floatSamples[i] * 32767));
    }
  } else {
     throw new Error("Unsupported audio format.");
  }


  return { channels, sampleRate, samples };
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
    const originalFile = selectedFile;

    try {
      setStatusText("Generating waveform...");
      const waveform = await generateWaveformData(originalFile);
      
      let finalAudioBlob: Blob;
      if (originalFile.type === 'audio/wav' || originalFile.type === 'audio/wave') {
          setStatusText("Converting WAV to MP3...");
          finalAudioBlob = await wavToMp3(originalFile);
      } else {
          finalAudioBlob = originalFile;
      }
      
      setStatusText("Uploading file...");
      
      const storageRef = ref(storage, `tracks/${user.uid}/${Date.now()}-${originalFile.name.replace(/\.[^/.]+$/, '.mp3')}`);
      const uploadTask = uploadBytesResumable(storageRef, finalAudioBlob);

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
            const trackTitle = originalFile.name.replace(/\.[^/.]+$/, "");

            const trackDocRef = await addDoc(collection(firestore, 'tracks'), {
              title: trackTitle,
              artist: user.displayName || 'Unknown Artist',
              audioUrl: downloadURL,
              storagePath: uploadTask.snapshot.ref.fullPath,
              waveform: waveform,
              userId: user.uid,
              createdAt: serverTimestamp(),
              commentCount: 0,
            });

            toast({ title: "Upload Successful", description: "Your track is ready and saved to your dashboard." });
            onUploadComplete(trackDocRef.id);
          } catch (error) {
            console.error("Error creating track document:", error);
            toast({ variant: "destructive", title: "Error Saving Track", description: "Your file was uploaded, but we couldn't save it to your dashboard. Please contact support." });
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
                <p className="text-xs text-muted-foreground">MP3 or WAV (MAX. 80MB)</p>
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
            {statusText === 'Uploading file...' && <Progress value={uploadProgress} />}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isProcessing || !selectedFile}>
        {isProcessing ? 'Processing...' : 'Create Session'}
      </Button>
    </form>
  );
}
