
'use client';

import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { storage, auth } from '@/lib/firebase';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { Progress } from './ui/progress';
import { processAndStoreTrack } from '@/app/actions';
import * as lamejs from '@breezystack/lamejs';

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
    if (file) {
      if (acceptedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null);
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select an MP3 or WAV file.",
        });
      }
    }
  };

  const convertWavToMp3 = async (wavFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          console.log('WAV file size:', arrayBuffer.byteLength);
          
          // Use Web Audio API to decode the WAV file
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          console.log('Decoded audio:', {
            channels: audioBuffer.numberOfChannels,
            sampleRate: audioBuffer.sampleRate,
            length: audioBuffer.length,
            duration: audioBuffer.duration
          });
          
          // Get the audio data (mix to mono if stereo)
          let samples: Float32Array;
          if (audioBuffer.numberOfChannels === 2) {
            // Mix stereo to mono
            const left = audioBuffer.getChannelData(0);
            const right = audioBuffer.getChannelData(1);
            samples = new Float32Array(audioBuffer.length);
            for (let i = 0; i < audioBuffer.length; i++) {
              samples[i] = (left[i] + right[i]) / 2;
            }
          } else {
            samples = audioBuffer.getChannelData(0);
          }
          
          // Convert to 16-bit PCM
          const pcmSamples = new Int16Array(samples.length);
          for (let i = 0; i < samples.length; i++) {
            const sample = Math.max(-1, Math.min(1, samples[i]));
            pcmSamples[i] = sample < 0 ? sample * 32768 : sample * 32767;
          }
          
          console.log('PCM samples created:', pcmSamples.length);
          
          // Initialize MP3 encoder (mono, original sample rate, 128kbps)
          const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
          const mp3Data: Uint8Array[] = [];
          
          const sampleBlockSize = 1152;
          
          // Encode in chunks
          for (let i = 0; i < pcmSamples.length; i += sampleBlockSize) {
            const chunk = pcmSamples.subarray(i, Math.min(i + sampleBlockSize, pcmSamples.length));
            
            console.log(`Encoding chunk ${Math.floor(i / sampleBlockSize) + 1}, size: ${chunk.length}`);
            
            // Make sure chunk is not empty and is valid
            if (chunk && chunk.length > 0) {
              const mp3buf = mp3Encoder.encodeBuffer(chunk);
              if (mp3buf && mp3buf.length > 0) {
                mp3Data.push(new Uint8Array(mp3buf));
              }
            }
          }
          
          // Flush remaining data
          const finalBuffer = mp3Encoder.flush();
          if (finalBuffer && finalBuffer.length > 0) {
            mp3Data.push(new Uint8Array(finalBuffer));
          }
          
          console.log(`Generated ${mp3Data.length} MP3 chunks`);
          
          // Create the final MP3 blob
          const mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });
          const mp3FileName = wavFile.name.replace(/\.[^/.]+$/, "") + ".mp3";
          const mp3File = new File([mp3Blob], mp3FileName, { type: 'audio/mpeg' });
          
          console.log(`Final MP3 file: ${mp3File.name}, size: ${mp3File.size} bytes`);
          resolve(mp3File);
          
        } catch (error) {
          console.error("Detailed conversion error:", error);
          console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
      
      reader.readAsArrayBuffer(wavFile);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to upload a track." });
      return;
    }

    if (!selectedFile) {
       toast({ variant: "destructive", title: "No file selected", description: "Please select a file to upload." });
      return;
    }
    
    setIsProcessing(true);
    
    let fileToUpload = selectedFile;
    
    if (selectedFile.type === 'audio/wav' || selectedFile.type === 'audio/wave') {
        setStatusText("Converting WAV to MP3...");
        try {
            fileToUpload = await convertWavToMp3(selectedFile);
        } catch (error) {
            toast({ variant: "destructive", title: "Conversion Failed", description: `Could not convert WAV to MP3. ${error instanceof Error ? error.message : ''}` });
            setIsProcessing(false);
            setStatusText("");
            return;
        }
    }

    setStatusText("Uploading file...");
    
    const finalStoragePath = `tracks/${user.uid}/${Date.now()}-${fileToUpload.name}`;
    const storageRef = ref(storage, finalStoragePath);
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
        toast({ variant: "destructive", title: "Upload Failed", description: `An error occurred while uploading: ${error.message}` });
      },
      async () => {
        try {
            setStatusText("Finalizing...");
            const trackId = await processAndStoreTrack({
                storagePath: finalStoragePath,
                originalFilename: fileToUpload.name,
                userId: user.uid,
                artistName: user.displayName || 'Unknown Artist',
            });
            
            toast({ title: "Upload Successful", description: "Your track is ready and saved to your dashboard." });
            onUploadComplete(trackId);

        } catch (error) {
            console.error("Error processing track on server:", error);
            toast({ variant: "destructive", title: "Processing Failed", description: `The server could not process your track. ${error instanceof Error ? error.message : ''}` });
        } finally {
            setIsProcessing(false);
            setUploadProgress(0);
            setStatusText("");
        }
      }
    );
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
            {(statusText.startsWith('Uploading')) && <Progress value={uploadProgress} />}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isProcessing || !selectedFile}>
        {isProcessing ? 'Processing...' : 'Create Session'}
      </Button>
    </form>
  );
}
