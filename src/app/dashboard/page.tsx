import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Music, MessageSquare, ListMusic } from "lucide-react";
import { getDashboardTracks } from "@/lib/data";

export default async function DashboardPage() {
  const tracks = await getDashboardTracks();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <Button asChild>
          <Link href="/">
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload New Track
          </Link>
        </Button>
      </div>

      <Card className="drop-shadow-custom-md">
        <CardHeader>
          <CardTitle>My Tracks</CardTitle>
          <CardDescription>A list of your uploaded tracks for feedback.</CardDescription>
        </CardHeader>
        <CardContent>
          {tracks.length > 0 ? (
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
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/track/${track.id}`}>View Feedback</Link>
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
              <Button asChild className="mt-4">
                <Link href="/">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Upload Track
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
