
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
import { Loader2, Sparkles, Zap } from "lucide-react";
import type { Comment } from "@/lib/types";
import { getSummary } from "@/app/actions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SummarizeButtonProps {
  comments: Comment[];
  isProUser: boolean;
}

export function SummarizeButton({ comments, isProUser }: SummarizeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = () => {
    startTransition(async () => {
      setError(null);
      const commentData = comments.map(c => ({ text: c.text, timestamp: c.timestamp, endTimestamp: c.endTimestamp }));
      const result = await getSummary(commentData);
      if (result.summary) {
        setSummary(result.summary);
      } else {
        setError("Could not generate summary. Please try again.");
      }
    });
  };

  const isDisabled = isPending || comments.length === 0 || !isProUser;

  const button = (
      <Button onClick={handleSummarize} disabled={isDisabled}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Summarize Feedback
      </Button>
  );

  return (
    <>
      {!isProUser ? (
         <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div tabIndex={0}>{button}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="flex items-center gap-2"><Zap className="text-primary" /> AI Summary is a Pro feature.</p>
              </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      ) : button}

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
