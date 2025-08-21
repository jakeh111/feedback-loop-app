

'use client';

import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Music, MessageSquare, ListMusic, Loader2, Trash2, Clock, User as UserIcon, CreditCard, Zap, CheckCircle } from "lucide-react";
import { UploadDialog } from "@/components/UploadDialog";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { deleteTrack } from '@/app/actions';
import { differenceInDays, addDays } from 'date-fns';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

const TRACK_LIFETIME_DAYS = 30;

export type DashboardTrack = {
  id: string;
  title: string;
  comments: number; 
  createdAt: Date;
};

const sampleTrack: DashboardTrack = {
    id: 'sample',
    title: 'Sample Track - My Masterpiece',
    comments: 2,
    createdAt: addDays(new Date(), -15), // Created 15 days ago
};

export function DashboardClient() {
  const [tracks, setTracks] = useState<DashboardTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<DashboardTrack | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);


  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const q = query(
        collection(firestore, 'tracks'),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribeTracks = onSnapshot(q, (querySnapshot) => {
        const userTracks: DashboardTrack[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled Track',
            comments: data.commentCount || 0,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          };
        });
        setTracks(userTracks);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching real-time tracks:", error);
        toast({
          variant: 'destructive',
          title: 'Error fetching tracks',
          description: 'Could not load your tracks. Please try again later.'
        })
        setTracks([]);
        setIsLoading(false);
      });

      return () => unsubscribeTracks();
    } else {
      // If user is logged out, clear tracks and loading state
      setTracks([]);
      setIsLoading(false);
    }
  }, [user, toast]); 

  const handleDeleteTrack = async () => {
    if (!trackToDelete) return;

    if (trackToDelete.id === 'sample') {
        toast({ title: 'Sample Track', description: 'This is a sample track and cannot be deleted.' });
        setTrackToDelete(null);
        return;
    }

    setIsDeleting(true);
    try {
      await deleteTrack(trackToDelete.id);
      toast({
        title: "Track Deleted",
        description: `"${trackToDelete.title}" has been permanently removed.`,
      });
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
       console.error("Failed to delete track:", error);
       toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: `Could not delete the track. ${errorMessage}`,
      });
    } finally {
      setIsDeleting(false);
      setTrackToDelete(null);
    }
  };

  const openDeleteDialog = (track: DashboardTrack) => {
    setTrackToDelete(track);
  };

  const getDaysLeft = (createdAt: Date) => {
    const expirationDate = addDays(createdAt, TRACK_LIFETIME_DAYS);
    const daysLeft = differenceInDays(expirationDate, new Date());
    return Math.max(0, daysLeft);
  }

  const showSampleTrack = !isLoading && user && tracks.length === 0;
  const displayTracks = showSampleTrack ? [sampleTrack] : tracks;
  const finalTracks = user ? displayTracks : [];


  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          {user && (
            <UploadDialog onUploadComplete={() => {}}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Upload New Track
              </Button>
            </UploadDialog>
          )}
        </div>

        {user && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
           <Card className="drop-shadow-custom-md">
              <CardHeader>
                <CardTitle>My Account</CardTitle>
                <CardDescription>View your account details and manage your subscription.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                        <UserIcon className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                       </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/profile">Edit Profile</Link>
                    </Button>
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                       <CreditCard className="h-6 w-6 text-primary" />
                       <div>
                          <p className="font-medium">Subscription Plan</p>
                          <p className="text-sm text-muted-foreground">You are currently on the Free Tier.</p>
                       </div>
                    </div>
                    <Button variant="outline" disabled>Manage Billing</Button>
                 </div>
              </CardContent>
            </Card>
            <Card className="drop-shadow-custom-md bg-gradient-to-br from-primary/10 to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="text-primary"/>
                        Upgrade to Pro
                    </CardTitle>
                    <CardDescription>Unlock powerful features to enhance your feedback workflow.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="text-primary w-5 h-5 mt-0.5" />
                            <span><span className="font-semibold">Permanent Track Storage:</span> Never lose a track or comment again. All your uploads are stored forever.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <CheckCircle className="text-primary w-5 h-5 mt-0.5" />
                            <span><span className="font-semibold">Unlimited Uploads:</span> No limits on the number of tracks you can upload and manage.</span>
                        </li>
                         <li className="flex items-start gap-3">
                            <CheckCircle className="text-primary w-5 h-5 mt-0.5" />
                           <span><span className="font-semibold">Advanced AI Analysis:</span> Get deeper insights with comment categorization and tonal analysis.</span>
                        </li>
                    </ul>
                    <Button className="w-full" disabled>Upgrade Now (Coming Soon)</Button>
                </CardContent>
            </Card>
          </div>
        )}

        <Card className="drop-shadow-custom-md">
          <CardHeader>
            <CardTitle>My Tracks</CardTitle>
            <CardDescription>A list of your uploaded tracks for feedback. Tracks are deleted after 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground p-12">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4">Loading your tracks...</p>
              </div>
            ) : finalTracks.length > 0 ? (
              <div className="space-y-4 md:hidden">
                {finalTracks.map((track) => {
                  const daysLeft = getDaysLeft(track.createdAt);
                  return (
                    <div key={track.id} className="border rounded-lg p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-medium flex items-center gap-2 flex-1 min-w-0">
                           <Music className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <Link href={`/track/${track.id}`} className="cursor-pointer hover:underline truncate">
                                {track.title}
                            </Link>
                        </div>
                         <Button onClick={() => openDeleteDialog(track)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 flex-shrink-0">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Link href={`/track/${track.id}`} className="flex items-center gap-2 hover:underline text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            {track.comments} Comments
                        </Link>
                        <Badge variant={daysLeft < 7 ? "destructive" : "secondary"}>
                            <Clock className="mr-2 h-4 w-4" />
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Deleting soon'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <ListMusic className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tracks uploaded</h3>
                <p className="mt-1 text-sm">Upload your first track to get started.</p>
                <UploadDialog onUploadComplete={() => {}}>
                    <Button className="mt-4">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Upload Track
                    </Button>
                </UploadDialog>
              </div>
            )}
             {finalTracks.length > 0 && (
                <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Track Title</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Time Left</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finalTracks.map((track) => {
                    const daysLeft = getDaysLeft(track.createdAt);
                    return (
                      <TableRow key={track.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                           <Music className="h-4 w-4 text-muted-foreground" />
                            <Link href={`/track/${track.id}`} className="cursor-pointer hover:underline">
                                {track.title}
                            </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/track/${track.id}`} className="flex items-center gap-2 hover:underline">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            {track.comments}
                          </Link>
                        </TableCell>
                         <TableCell>
                            <Badge variant={daysLeft < 7 ? "destructive" : "secondary"}>
                                <Clock className="mr-2 h-4 w-4" />
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Deleting soon'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button onClick={() => openDeleteDialog(track)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
             )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!trackToDelete} onOpenChange={() => setTrackToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the track
              "{trackToDelete?.title}" and all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrack} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
