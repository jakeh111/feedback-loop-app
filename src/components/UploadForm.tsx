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
import * as lamejs from 'lamejs';

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
        reader.onload = (event) => {
            try {
                const wavBuffer = event.target?.result as ArrayBuffer;
                const wav = lamejs.WavHeader.readHeader(new DataView(wavBuffer));
                const samples = new Int16Array(wavBuffer, wav.dataOffset, wav.dataLen / 2);
                
                const mp3Encoder = new lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 128);
                const mp3Data = [];

                const sampleBlockSize = 1152; // Encoder internal sample block size
                for (let i = 0; i < samples.length; i += sampleBlockSize) {
                    const sampleChunk = samples.subarray(i, i + sampleBlockSize);
                    const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
                    if (mp3buf.length > 0) {
                        mp3Data.push(mp3buf);
                    }
                }
                const mp3buf = mp3Encoder.flush();
                if (mp3buf.length > 0) {
                    mp3Data.push(mp3buf);
                }

                const mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });
                const mp3FileName = wavFile.name.replace(/\.[^/.]+$/, "") + ".mp3";
                const mp3File = new File([mp3Blob], mp3FileName, { type: 'audio/mpeg' });
                resolve(mp3File);

            } catch(error) {
                console.error("Error converting WAV to MP3:", error);
                reject(error);
            }
        };
        reader.onerror = (error) => {
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
