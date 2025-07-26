"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Track, Comment } from '@/lib/types';
import { AudioPlayer } from '@/components/AudioPlayer';
import { CommentList } from '@/components/CommentList';
import { AddCommentForm } from '@/components/AddCommentForm';
import { SummarizeButton } from '@/components/SummarizeButton';
import { Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export function TrackPageClient({ track }: { track: Track }) {
  const [comments, setComments] = useState<Comment[]>(track.comments);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [authorName, setAuthorName] = useState("Guest");

  useEffect(() => {
    const author = searchParams.get('author');
    if (author) {
      setAuthorName(author);
    }
  }, [searchParams]);

  const handleAddComment = (text: string) => {
    if (audioRef.current) {
      const newComment: Comment = {
        id: new Date().toISOString(),
        author: authorName,
        text,
        timestamp: Math.floor(audioRef.current.currentTime),
        avatarUrl: `https://placehold.co/40x40.png?text=${authorName.charAt(0)}`,
      };
      setComments(prev => [...prev, newComment]);
    }
  };

  const handleSeekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      audioRef.current.play();
    }
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "You can now share this feedback page.",
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline">{track.title}</h1>
          <p className="text-lg text-muted-foreground">{track.artist}</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <SummarizeButton comments={comments} />
        </div>
      </div>

      <AudioPlayer ref={audioRef} track={track} onSeek={handleSeekTo} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <h2 className="text-2xl font-bold font-headline mb-4">Feedback & Comments</h2>
            <CommentList comments={comments} onSeekTo={handleSeekTo} />
        </div>
        <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Leave Feedback</h2>
            <AddCommentForm onAddComment={handleAddComment} />
        </div>
      </div>
    </div>
  );
}
