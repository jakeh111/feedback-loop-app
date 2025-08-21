
"use client";

import type { Comment, SubComment } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Clock, GitCommitHorizontal, Youtube, MessageSquareReply, Send } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "./ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useState } from "react";
import { Textarea } from "./ui/textarea";

interface CommentListProps {
  comments: Comment[];
  onSeekTo: (time: number) => void;
  lastViewedAt?: Date;
  onToggleComplete?: (commentId: string, currentStatus: boolean) => void;
  onAddReply?: (commentId: string, replyText: string) => void;
  isOwner: boolean;
}

export function CommentList({ comments, onSeekTo, lastViewedAt, onToggleComplete, onAddReply, isOwner }: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
    
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleYoutubeLink = (url: string, timestamp?: number) => {
    let finalUrl = url;
    if (timestamp && timestamp > 0) {
        if (finalUrl.includes('?')) {
            finalUrl += `&t=${timestamp}s`;
        } else {
            finalUrl += `?t=${timestamp}s`;
        }
    }
    window.open(finalUrl, '_blank');
  }

  const handleReplySubmit = (commentId: string) => {
    if (replyText.trim() && onAddReply) {
      onAddReply(commentId, replyText);
      setReplyText("");
      setReplyingTo(null);
    }
  }

  if (comments.length === 0) {
    return (
        <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
            <p>No comments yet.</p>
            <p className="text-sm">Be the first to leave feedback!</p>
        </div>
    )
  }
  
  const lastViewedTime = lastViewedAt ? lastViewedAt.getTime() : 0;

  return (
    <div className="space-y-4">
      {[...comments].sort((a,b) => a.timestamp - b.timestamp).map((comment) => {
        const commentTime = (comment.createdAt as Date).getTime();
        const isNew = lastViewedTime > 0 && commentTime > lastViewedTime;
        
        return (
            <Card key={comment.id} className={cn("drop-shadow-custom-md transition-all duration-300", 
                isNew && "bg-primary/5 border-primary/20",
                comment.completed && "opacity-60 bg-muted/30"
            )}>
              <CardHeader className="flex flex-row items-start gap-4 p-4 bg-muted/50">
                {onToggleComplete && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Checkbox
                                    checked={comment.completed}
                                    onCheckedChange={() => onToggleComplete(comment.id, !!comment.completed)}
                                    aria-label="Mark as complete"
                                    className="mt-1"
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Mark as completed</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <Avatar>
                  <AvatarImage src={comment.avatarUrl} alt={comment.author} />
                  <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold">{comment.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt as Date), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                    {isNew && <Badge variant="default" className="text-xs px-1.5 py-0.5 pointer-events-none">New</Badge>}
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
              <CardContent className="p-4 pl-14 space-y-4">
                <p className={cn(comment.completed && "line-through text-muted-foreground")}>{comment.text}</p>
                
                {comment.subComments && comment.subComments.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-dashed">
                    {comment.subComments.map(reply => (
                      <div key={reply.id} className="flex items-start gap-3">
                         <Avatar className="w-8 h-8">
                          <AvatarImage src={reply.avatarUrl} alt={reply.author} />
                          <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <p className="font-semibold text-sm">{reply.author}</p>
                          <p className="text-xs text-muted-foreground">
                             {format(new Date(reply.createdAt as Date), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          <p className="mt-1">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {isOwner && (
                  <div className="pt-2">
                    {replyingTo === comment.id ? (
                      <div className="space-y-2">
                        <Textarea 
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          rows={2}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleReplySubmit(comment.id)} disabled={!replyText.trim()}>
                            <Send className="mr-2 h-4 w-4" /> Reply
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setReplyingTo(comment.id)}>
                        <MessageSquareReply className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
        )
      })}
    </div>
  );
}
