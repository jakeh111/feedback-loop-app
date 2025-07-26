"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Clock, Check, X, GitCommitHorizontal } from 'lucide-react';

interface AddCommentFormProps {
  onAddComment: (text: string, startTime: number, endTime?: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export function AddCommentForm({ onAddComment, audioRef }: AddCommentFormProps) {
  const [text, setText] = useState('');
  const [isRangeSelection, setIsRangeSelection] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSetStartTime = () => {
    if (audioRef.current) {
      setStartTime(audioRef.current.currentTime);
      setEndTime(null);
    }
  };

  const handleSetEndTime = () => {
    if (audioRef.current && startTime !== null) {
      const currentTime = audioRef.current.currentTime;
      if (currentTime > startTime) {
        setEndTime(currentTime);
      }
    }
  };
  
  const handleToggleRangeSelection = () => {
      setIsRangeSelection(!isRangeSelection);
      setStartTime(null);
      setEndTime(null);
  }

  const handleCancelRange = () => {
    setIsRangeSelection(false);
    setStartTime(null);
    setEndTime(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && audioRef.current) {
      if (isRangeSelection && startTime !== null && endTime !== null) {
        onAddComment(text, startTime, endTime);
      } else {
        onAddComment(text, audioRef.current.currentTime);
      }
      setText('');
      handleCancelRange();
    }
  };

  const canSubmit = text.trim() && (!isRangeSelection || (startTime !== null && endTime !== null));

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={isRangeSelection ? "Describe the feedback for the selected range..." : "Leave a comment at the current timestamp..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
          
          <div className="flex justify-between items-center">
             <Button type="button" variant="ghost" onClick={handleToggleRangeSelection} size="sm">
                <GitCommitHorizontal className="mr-2 h-4 w-4" />
                {isRangeSelection ? 'Comment on Timestamp' : 'Comment on Range'}
            </Button>
          </div>

          {isRangeSelection && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-3">
              <div className="text-sm font-medium">Select Time Range:</div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleSetStartTime} className="w-full">
                  Set Start
                </Button>
                <Button type="button" variant="outline" onClick={handleSetEndTime} disabled={startTime === null} className="w-full">
                  Set End
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {startTime !== null ? (
                  <>
                    {formatTime(startTime)} - {endTime !== null ? formatTime(endTime) : '...'}
                  </>
                ) : 'No range selected'}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleCancelRange} className="w-full text-destructive">
                <X className="mr-2 h-4 w-4" />
                Cancel Range
              </Button>
            </div>
          )}

          <Button type="submit" disabled={!canSubmit} className="w-full">
            Post Comment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
