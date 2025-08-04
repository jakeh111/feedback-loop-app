"use client";

import type { Comment } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Clock, GitCommitHorizontal, Youtube } from "lucide-react";

interface CommentListProps {
  comments: Comment[];
  onSeekTo: (time: number) => void;
}

export function CommentList({ comments, onSeekTo }: CommentListProps) {
    
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleYoutubeLink = (url: string, timestamp?: number) => {
    let finalUrl = url;
    if (timestamp && timestamp > 0) {
        // Basic check to see if we should use ?t or &t
        if (finalUrl.includes('?')) {
            finalUrl += `&t=${timestamp}s`;
        } else {
            finalUrl += `?t=${timestamp}s`;
        }
    }
    window.open(finalUrl, '_blank');
  }

  if (comments.length === 0) {
    return (
        <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
            <p>No comments yet.</p>
            <p className="text-sm">Be the first to leave feedback!</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {[...comments].sort((a,b) => a.timestamp - b.timestamp).map((comment) => (
        <Card key={comment.id} className="overflow-hidden drop-shadow-custom-md">
          <CardHeader className="flex flex-row items-center gap-4 p-4 bg-muted/50">
            <Avatar>
              <AvatarImage src={comment.avatarUrl} alt={comment.author} />
              <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="font-semibold">{comment.author}</p>
            </div>
            <div className="flex items-center gap-1">
                {comment.youtubeUrl && (
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500" onClick={() => handleYoutubeLink(comment.youtubeUrl!, comment.youtubeTimestamp)}>
                        <Youtube className="h-5 w-5" />
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => onSeekTo(comment.timestamp)} className="text-accent hover:text-accent font-mono">
                    {comment.endTimestamp ? <GitCommitHorizontal className="mr-2 h-4 w-4" /> : <Clock className="mr-2 h-4 w-4" />}
                    {formatTime(comment.timestamp)}
                    {comment.endTimestamp && ` - ${formatTime(comment.endTimestamp)}`}
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p>{comment.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
