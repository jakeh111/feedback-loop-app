
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Track, Comment } from '@/lib/types';
import { AudioPlayer } from '@/components/AudioPlayer';
import { CommentList } from '@/components/CommentList';
import { AddCommentForm } from '@/components/AddCommentForm';
import { SummarizeButton } from '@/components/SummarizeButton';
import { Share2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { firestore, auth } from '@/lib/firebase';
import { addComment } from '@/app/actions';
import { onAuthStateChanged, type User } from 'firebase/auth';


export function TrackPageClient({ track }: { track: Track }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [authorName, setAuthorName] = useState("Guest");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Set author name based on auth state or query params
    if (user) {
      setAuthorName(user.displayName || "Authenticated User");
    } else {
      const authorFromUrl = searchParams.get('author');
      if (authorFromUrl) {
        setAuthorName(authorFromUrl);
      } else {
        setAuthorName("Guest");
      }
    }
  }, [user, searchParams]);

  useEffect(() => {
    setIsLoadingComments(true);
    const commentsRef = collection(firestore, 'tracks', track.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate(), // Convert Firestore Timestamp to Date
        } as Comment;
      });
      setComments(fetchedComments);
      setIsLoadingComments(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load comments.",
      });
      setIsLoadingComments(false);
    });

    return () => unsubscribe();
  }, [track.id, toast]);

  const handleAddComment = async (text: string, startTime: number, endTime?: number, youtubeUrl?: string, youtubeTimestamp?: number) => {
    const finalAuthorName = user?.displayName || authorName;
    const commentData = {
      author: finalAuthorName,
      text,
      timestamp: startTime,
      endTimestamp: endTime,
      avatarUrl: user?.photoURL || `https://placehold.co/40x40.png?text=${finalAuthorName.charAt(0)}`,
      youtubeUrl,
      youtubeTimestamp
    };
    
    try {
      await addComment(track.id, commentData);
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not post your comment. ${error instanceof Error ? error.message : ''}`,
      });
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

      <AudioPlayer ref={audioRef} track={track} onSeek={handleSeekTo} comments={comments} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <h2 className="text-2xl font-bold font-headline mb-4">Feedback & Comments</h2>
            {isLoadingComments ? (
                 <div className="text-center text-muted-foreground p-12">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4">Loading comments...</p>
              </div>
            ) : (
                <CommentList comments={comments} onSeekTo={handleSeekTo} />
            )}
        </div>
        <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Leave Feedback</h2>
            <AddCommentForm onAddComment={handleAddComment} audioRef={audioRef} />
        </div>
      </div>
    </div>
  );
}
