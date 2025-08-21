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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = auth.currentUser;

    // Diagnostic log to verify auth status
    console.log('Current user at time of upload:', auth.currentUser);

    if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to upload a track." });
      return;
    }

    if (!selectedFile) {
       toast({ variant: "destructive", title: "No file selected", description: "Please select a file to upload." });
      return;
    }
    
    setIsProcessing(true);
    setStatusText("Uploading file...");
    
    // Upload directly to the final destination
    const finalStoragePath = `tracks/${user.uid}/${Date.now()}-${selectedFile.name}`;
    const storageRef = ref(storage, finalStoragePath);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

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
        toast({ variant: "destructive", title: "Upload Failed", description: `An error occurred while uploading: ${error.code} - ${error.message}` });
      },
      async () => {
        // Upload complete, now call the server action to create the DB record.
        try {
            setStatusText("Finalizing...");
            const trackId = await processAndStoreTrack({
                storagePath: finalStoragePath,
                originalFilename: selectedFile.name,
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
            {(statusText === 'Uploading file...') && <Progress value={uploadProgress} />}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isProcessing || !selectedFile}>
        {isProcessing ? 'Processing...' : 'Create Session'}
      </Button>
    </form>
  );
}
