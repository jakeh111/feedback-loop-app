'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Track, Comment } from '@/lib/types';
import { AudioPlayer, type AudioPlayerRef } from '@/components/AudioPlayer';
import { CommentList } from '@/components/CommentList';
import { AddCommentForm } from '@/components/AddCommentForm';
import { SummarizeButton } from '@/components/SummarizeButton';
import { GuestNameDialog } from '@/components/GuestNameDialog';
import { AdBanner } from '@/components/AdBanner';
import { Share2, Loader2, Pencil, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, auth } from '@/lib/firebase';
import { addComment, renameTrack } from '@/app/actions';
import { onAuthStateChanged, type User } from 'firebase/auth';

const sampleComments: Comment[] = [
  {
    id: 'comment-1',
    author: 'Alice',
    text: "The kick drum feels a bit too punchy around 0:15. Maybe scoop out some mids?",
    timestamp: 15,
    avatarUrl: 'https://placehold.co/40x40.png?text=A',
    createdAt: new Date(),
  },
  {
    id: 'comment-2',
    author: 'Bob',
    text: "Love the synth melody that comes in from 0:30 to 0:45! It's super catchy.",
    timestamp: 30,
    endTimestamp: 45,
    avatarUrl: 'https://placehold.co/40x40.png?text=B',
    createdAt: new Date(),
     youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeTimestamp: 43
  },
];


export function TrackPageClient({ track: initialTrack }: { track: Track }) {
  const [track, setTrack] = useState(initialTrack);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [activeComment, setActiveComment] = useState<Comment | null>(null);


  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(track.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isProUser = false;
  const isOwner = user?.uid === track.userId;

  // Mark track as viewed by owner
  useEffect(() => {
    if (isOwner && track.id !== 'sample') {
      const trackRef = doc(firestore, 'tracks', track.id);
      setDoc(trackRef, { lastViewedAt: serverTimestamp() }, { merge: true });
    }
  }, [isOwner, track.id]);


  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (track.id === 'sample') {
      setComments(sampleComments);
      setIsLoadingComments(false);
    } else {
        setIsLoadingComments(true);
        const commentsRef = collection(firestore, 'tracks', track.id, 'comments');
        const q = query(commentsRef, orderBy('timestamp', 'asc'));

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
    }
  }, [track.id, toast]);


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
          if (auth.app.name) { // check if auth is initialized
             setTimeout(() => setIsGuestPromptOpen(true), 100);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [track.id]);
  
  const handleNameSubmit = (name: string) => {
    sessionStorage.setItem(`guestName-${track.id}`, name);
    setAuthorName(name);
    setIsGuestPromptOpen(false);
  };

  const handleAddComment = async (text: string, startTime: number, endTime?: number, youtubeUrl?: string, youtubeTimestamp?: number) => {
    if (track.id === 'sample') {
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        author: authorName,
        text,
        timestamp: startTime,
        endTimestamp,
        avatarUrl: user?.photoURL || `https://placehold.co/40x40.png?text=${authorName.charAt(0).toUpperCase()}`,
        youtubeUrl,
        youtubeTimestamp,
        createdAt: new Date(),
      };
      setComments(prev => [...prev, newComment]);
      toast({ title: "Sample Comment Added", description: "This comment is only visible in this session." });
      return;
    }

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
    if (audioPlayerRef.current) {
      audioPlayerRef.current.seekTo(time);
    }
  }, []);
  
  const handleTimeUpdate = (time: number) => {
    setSelectedTime(time);
  };


  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "You can now share this feedback page.",
    });
  };

  const handleRenameSubmit = async () => {
    if (!isOwner || !isEditingTitle) return;

    const newTitle = editingTitle.trim();
    if (newTitle === '' || newTitle === track.title) {
        setIsEditingTitle(false);
        setEditingTitle(track.title); // Revert if empty or unchanged
        return;
    }

    try {
      await renameTrack(track.id, newTitle);
      setTrack(prev => ({ ...prev, title: newTitle }));
      toast({
        title: "Track Renamed",
        description: `Successfully renamed track to "${newTitle}".`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Rename Failed",
        description: `Could not rename the track. ${errorMessage}`,
      });
      setEditingTitle(track.title); // Revert UI on failure
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditingTitle(track.title);
    }
  };

  
  const isCommentingEnabled = !!authorName;

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <GuestNameDialog isOpen={isGuestPromptOpen} onNameSubmit={handleNameSubmit} />

      <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
        <div>
            <div className="flex items-center gap-2">
                {isEditingTitle ? (
                    <Input
                        ref={titleInputRef}
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={handleTitleKeyDown}
                        className="text-3xl md:text-4xl font-bold font-headline h-auto p-1 -m-1 border border-primary/50 focus-visible:ring-primary bg-transparent"
                    />
                ) : (
                    <h1 className="text-3xl md:text-4xl font-bold font-headline">{track.title}</h1>
                )}
                
                {isOwner && !isEditingTitle && track.id !== 'sample' && (
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingTitle(true)} className="flex-shrink-0">
                        <Pencil className="h-5 w-5" />
                    </Button>
                )}
            </div>
            <p className="text-lg text-muted-foreground">{track.artist}</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <SummarizeButton comments={comments} isProUser={isProUser} />
        </div>
      </div>
        
      <div className="relative mb-4">
        {activeComment && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-full max-w-4xl mb-2 px-4 z-10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-popover text-popover-foreground rounded-lg p-3 shadow-lg border text-center">
                    <p className="font-semibold text-sm">{activeComment.author}</p>
                    <p className="text-base text-muted-foreground italic">"{truncateText(activeComment.text, 100)}"</p>
                </div>
            </div>
        )}
        <AudioPlayer 
            key={track.id} 
            ref={audioPlayerRef} 
            track={track} 
            comments={comments} 
            onTimeUpdate={handleTimeUpdate} 
            onDurationChange={setTrackDuration} 
            onCommentActive={setActiveComment}
        />
      </div>


      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <h2 className="text-2xl font-bold font-headline mb-4">Feedback & Comments</h2>
            {isLoadingComments ? (
                 <div className="text-center text-muted-foreground p-12">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4">Loading comments...</p>
              </div>
            ) : (
                <CommentList 
                  comments={comments} 
                  onSeekTo={handleSeekTo}
                  lastViewedAt={isOwner ? track.lastViewedAt : undefined}
                />
            )}
        </div>
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Leave Feedback {authorName && <span className="text-sm text-muted-foreground font-normal">as {authorName}</span>}</h2>
                <AddCommentForm onAddComment={handleAddComment} audioPlayerRef={audioPlayerRef} isCommentingEnabled={isCommentingEnabled} selectedTime={selectedTime} />
            </div>
             {!isProUser && (
                <div>
                    <h2 className="text-xs font-headline mb-4 text-muted-foreground text-center">SPONSORED</h2>
                    <AdBanner />
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
