
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Music, MessageSquare, ListMusic, Loader2, Trash2 } from "lucide-react";
import { getDashboardTracks, type DashboardTrack } from "@/lib/data";
import { UploadDialog } from "@/components/UploadDialog";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
import { deleteTrack } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';


export default function DashboardPage() {
  const [tracks, setTracks] = useState<DashboardTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<DashboardTrack | null>(null);
  const { toast } = useToast();

  const fetchTracks = useCallback(async () => {
    setIsLoading(true);
    const userTracks = await getDashboardTracks();
    setTracks(userTracks);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuth(true);
        fetchTracks();
      } else {
        setIsAuth(false);
        setTracks([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchTracks]);

  const handleDeleteTrack = async () => {
    if (!trackToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTrack(trackToDelete.id);
      toast({
        title: "Track Deleted",
        description: `"${trackToDelete.title}" has been permanently removed.`,
      });
      // This is a more robust way to refresh the list after deletion
      setTracks(currentTracks => currentTracks.filter(t => t.id !== trackToDelete.id));
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

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          {isAuth && (
            <UploadDialog onUploadComplete={fetchTracks}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Upload New Track
              </Button>
            </UploadDialog>
          )}
        </div>

        <Card className="drop-shadow-custom-md">
          <CardHeader>
            <CardTitle>My Tracks</CardTitle>
            <CardDescription>A list of your uploaded tracks for feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground p-12">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4">Loading your tracks...</p>
              </div>
            ) : tracks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Track Title</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Date Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracks.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Music className="h-4 w-4 text-muted-foreground" />
                        {track.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          {track.comments}
                        </div>
                      </TableCell>
                      <TableCell>{track.date}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/track/${track.id}`}>View Feedback</Link>
                        </Button>
                         <Button onClick={() => setTrackToDelete(track)} variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <ListMusic className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tracks uploaded</h3>
                <p className="mt-1 text-sm">Upload your first track to get started.</p>
                <UploadDialog onUploadComplete={fetchTracks}>
                    <Button className="mt-4">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Upload Track
                    </Button>
                </UploadDialog>
              </div>
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
