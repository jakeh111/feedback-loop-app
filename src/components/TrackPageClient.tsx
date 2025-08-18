
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Track, Comment } from '@/lib/types';
import { AudioPlayer } from '@/components/AudioPlayer';
import { CommentList } from '@/components/CommentList';
import { AddCommentForm } from '@/components/AddCommentForm';
import { SummarizeButton } from '@/components/SummarizeButton';
import { GuestNameDialog } from '@/components/GuestNameDialog';
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
  const [user, setUser] = useState<User | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthorName(currentUser.displayName || "Authenticated User");
        setIsGuestPromptOpen(false); // Close prompt if user logs in
      } else {
        // Defer guest check until auth state is confirmed to be null
        const guestName = sessionStorage.getItem(`guestName-${track.id}`);
        if (guestName) {
          setAuthorName(guestName);
        } else {
          // Only open prompt if auth is resolved and user is not logged in
          if (unsubscribe) { // check if auth listener is active
             setTimeout(() => setIsGuestPromptOpen(true), 100);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [track.id]);

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
  
  const handleNameSubmit = (name: string) => {
    sessionStorage.setItem(`guestName-${track.id}`, name);
    setAuthorName(name);
    setIsGuestPromptOpen(false);
  };

  const handleAddComment = async (text: string, startTime: number, endTime?: number, youtubeUrl?: string, youtubeTimestamp?: number) => {
    if (!authorName) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot comment without a name.",
        });
        return;
    }

    const commentData = {
      author: authorName,
      text,
      timestamp: startTime,
      endTimestamp: endTime,
      avatarUrl: user?.photoURL || `https://placehold.co/40x40.png?text=${authorName.charAt(0).toUpperCase()}`,
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
  
  const isCommentingEnabled = !!authorName;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <GuestNameDialog isOpen={isGuestPromptOpen} onNameSubmit={handleNameSubmit} />

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
            <h2 className="text-2xl font-bold font-headline mb-4">Leave Feedback {authorName && <span className="text-sm text-muted-foreground font-normal">as {authorName}</span>}</h2>
            <AddCommentForm onAddComment={handleAddComment} audioRef={audioRef} isCommentingEnabled={isCommentingEnabled} />
        </div>
      </div>
    </div>
  );
}
