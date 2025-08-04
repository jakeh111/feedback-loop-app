"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Clock, Check, X, GitCommitHorizontal, Youtube, Link } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

interface AddCommentFormProps {
  onAddComment: (text: string, startTime: number, endTime?: number, youtubeUrl?: string, youtubeTimestamp?: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export function AddCommentForm({ onAddComment, audioRef }: AddCommentFormProps) {
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
  
  const resetForm = () => {
    setText('');
    handleCancelRange();
    setShowYoutube(false);
    setYoutubeUrl('');
    setYoutubeTime('');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && audioRef.current) {
      const finalYoutubeTimestamp = showYoutube ? parseYoutubeTime(youtubeTime) : undefined;
      const finalYoutubeUrl = showYoutube ? youtubeUrl : undefined;

      if (isRangeSelection && startTime !== null && endTime !== null) {
        onAddComment(text, startTime, endTime, finalYoutubeUrl, finalYoutubeTimestamp);
      } else {
        onAddComment(text, audioRef.current.currentTime, undefined, finalYoutubeUrl, finalYoutubeTimestamp);
      }
      resetForm();
    }
  };

  const canSubmit = text.trim() && (!isRangeSelection || (startTime !== null && endTime !== null));

  return (
    <Card className="drop-shadow-md">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Leave a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
          
          <div className="flex flex-wrap justify-start items-center gap-2">
             <Button type="button" variant="ghost" onClick={handleToggleRangeSelection} size="sm">
                <GitCommitHorizontal className="mr-2 h-4 w-4" />
                {isRangeSelection ? 'Comment on Timestamp' : 'Comment on Range'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowYoutube(!showYoutube)} size="sm">
                <Youtube className="mr-2 h-4 w-4" />
                {showYoutube ? 'Remove Reference' : 'Add YouTube Reference'}
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
