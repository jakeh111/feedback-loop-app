
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Clock, Check, X, GitCommitHorizontal, Youtube, Link, Pin } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import type { AudioPlayerRef } from './AudioPlayer';

interface AddCommentFormProps {
  onAddComment: (text: string, startTime: number, endTime?: number, youtubeUrl?: string, youtubeTimestamp?: number) => void;
  audioPlayerRef: React.RefObject<AudioPlayerRef>;
  isCommentingEnabled: boolean;
  selectedTime: number;
}

export function AddCommentForm({ onAddComment, audioPlayerRef, isCommentingEnabled, selectedTime }: AddCommentFormProps) {
  const [text, setText] = useState('');
  const [isRangeSelection, setIsRangeSelection] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const [showYoutube, setShowYoutube] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTime, setYoutubeTime] = useState('');

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const parseYoutubeTime = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  const handleSetStartTime = () => {
      setStartTime(selectedTime);
      setEndTime(null);
  };

  const handleSetEndTime = () => {
    if (startTime !== null) {
      if (selectedTime > startTime) {
        setEndTime(selectedTime);
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
  
  const resetForm = () => {
    setText('');
    handleCancelRange();
    setShowYoutube(false);
    setYoutubeUrl('');
    setYoutubeTime('');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      const finalYoutubeTimestamp = showYoutube ? parseYoutubeTime(youtubeTime) : undefined;
      const finalYoutubeUrl = showYoutube ? youtubeUrl : undefined;

      if (isRangeSelection && startTime !== null && endTime !== null) {
        onAddComment(text, startTime, endTime, finalYoutubeUrl, finalYoutubeTimestamp);
      } else {
        onAddComment(text, selectedTime, undefined, finalYoutubeUrl, finalYoutubeTimestamp);
      }
      resetForm();
    }
  };

  const canSubmit = text.trim() && isCommentingEnabled;
  const placeholderText = isCommentingEnabled ? "Leave a comment..." : "Please enter your name to comment.";

  return (
    <Card className="drop-shadow-custom-md">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={placeholderText}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            disabled={!isCommentingEnabled}
          />
          
          {!isRangeSelection && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded-lg">
                <Pin className="h-4 w-4 text-primary" />
                <span>Commenting at {formatTime(selectedTime)}</span>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row justify-start items-stretch md:items-center gap-2">
             <Button type="button" variant="ghost" onClick={handleToggleRangeSelection} size="sm" disabled={!isCommentingEnabled} className="justify-start">
                <GitCommitHorizontal className="mr-2 h-4 w-4" />
                <span className="flex-shrink-0">{isRangeSelection ? 'Comment on Timestamp' : 'Comment on Range'}</span>
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowYoutube(!showYoutube)} size="sm" disabled={!isCommentingEnabled} className="justify-start">
                <Youtube className="mr-2 h-4 w-4" />
                <span className="flex-shrink-0">{showYoutube ? 'Remove Reference' : 'Add YouTube Reference'}</span>
            </Button>
          </div>

          {isRangeSelection && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-3">
              <div className="text-sm font-medium">Select Time Range:</div>
              <div className="text-sm text-muted-foreground">Seek in the waveform and use the buttons below.</div>
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
            </div>
          )}

          {showYoutube && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                 <div className="text-sm font-medium">YouTube Reference:</div>
                 <div className="space-y-2">
                    <Label htmlFor="youtube-url">YouTube URL</Label>
                    <Input id="youtube-url" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="youtube-time">Timestamp (MM:SS)</Label>
                    <Input id="youtube-time" placeholder="01:23" value={youtubeTime} onChange={(e) => setYoutubeTime(e.target.value)} />
                 </div>
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
