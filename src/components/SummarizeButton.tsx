"use client";

import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { Loader2, Sparkles } from "lucide-react";
import type { Comment } from "@/lib/types";
import { getSummary } from "@/app/actions";

interface SummarizeButtonProps {
  comments: Comment[];
}

export function SummarizeButton({ comments }: SummarizeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = () => {
    startTransition(async () => {
      setError(null);
      const commentData = comments.map(c => ({ text: c.text, timestamp: c.timestamp }));
      const result = await getSummary(commentData);
      if (result.summary) {
        setSummary(result.summary);
      } else {
        setError("Could not generate summary. Please try again.");
      }
    });
  };

  return (
    <>
      <Button onClick={handleSummarize} disabled={isPending || comments.length === 0}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Summarize Feedback
      </Button>

      <AlertDialog open={!!summary || !!error} onOpenChange={() => { setSummary(null); setError(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
                {error ? "Error" : "AI Feedback Summary"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {summary || error}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
