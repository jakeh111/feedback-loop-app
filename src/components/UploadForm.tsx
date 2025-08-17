
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { Progress } from './ui/progress';

export function UploadForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
       toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an MP3 or WAV file to upload.",
      });
      return;
    }
    
    setIsUploading(true);
    
    // In a real app, this ID would come from creating a document in Firestore.
    const trackId = Math.random().toString(36).substring(2, 15);
    const storageRef = ref(storage, `tracks/${trackId}/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        setIsUploading(false);
        setUploadProgress(0);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "An error occurred while uploading your track. Please try again.",
        });
      },
      () => {
        toast({
          title: "Upload Successful",
          description: "Your track is ready.",
        });
        router.push(`/track/${trackId}`);
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
                <p className="text-xs text-muted-foreground">MP3 or WAV (MAX. 80MB)</p>
            </div>
            <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".mp3,.wav,audio/mpeg,audio/wave" disabled={isUploading} />
        </label>
      </div>

      {selectedFile && !isUploading && <p className="text-sm text-center text-muted-foreground">Selected: {selectedFile.name}</p>}

      {isUploading && (
        <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">Uploading: {selectedFile?.name}</p>
            <Progress value={uploadProgress} />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isUploading || !selectedFile}>
        {isUploading ? 'Uploading...' : 'Upload Track'}
      </Button>
    </form>
  );
}
