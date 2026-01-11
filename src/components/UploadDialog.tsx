
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadForm } from "./UploadForm";
import { useRouter } from "next/navigation";

interface UploadDialogProps {
  children: React.ReactNode;
  onUploadComplete?: (trackId?: string) => void;
}

export function UploadDialog({ children, onUploadComplete }: UploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleUploadComplete = (trackId: string) => {
    setIsOpen(false);
    // Always redirect to the track page.
    router.push(`/track/${trackId}`);
    if (onUploadComplete) {
      onUploadComplete(trackId);
    }
  };

  const handleUploadBlocked = () => {
    setIsOpen(false);
    if(onUploadComplete) {
        onUploadComplete();
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Track</DialogTitle>
          <DialogDescription>
            Select an MP3 file to start a new feedback session. Pro users can upload WAV files.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <UploadForm onUploadComplete={handleUploadComplete} onUploadBlocked={handleUploadBlocked} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
