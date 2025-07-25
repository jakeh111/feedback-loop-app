import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Music, MessageSquare } from "lucide-react";

const mockTracks = [
  { id: "a1b2c3d4", title: "Sunset Groove", comments: 5, date: "2024-05-10" },
  { id: "e5f6g7h8", title: "Midnight Mix v3", comments: 12, date: "2024-05-08" },
  { id: "i9j0k1l2", title: "Vocal Takes - Final", comments: 8, date: "2024-05-05" },
  { id: "m3n4o5p6", title: "Acoustic Demo", comments: 2, date: "2024-05-02" },
];

export default function DashboardPage() {
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

      <Card>
        <CardHeader>
          <CardTitle>My Tracks</CardTitle>
          <CardDescription>A list of your uploaded tracks for feedback.</CardDescription>
        </CardHeader>
        <CardContent>
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
              {mockTracks.map((track) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
