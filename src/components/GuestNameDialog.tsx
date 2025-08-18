
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";

interface GuestNameDialogProps {
  isOpen: boolean;
  onNameSubmit: (name: string) => void;
}

export function GuestNameDialog({ isOpen, onNameSubmit }: GuestNameDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome! What's your name?</AlertDialogTitle>
          <AlertDialogDescription>
            Please enter your name to leave feedback. This will be visible to the track owner.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                 <Label htmlFor="guest-name">Your Name</Label>
                 <Input
                    id="guest-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    required
                    autoFocus
                />
            </div>
            <AlertDialogFooter>
                <Button type="submit" disabled={!name.trim()}>Continue</Button>
            </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
