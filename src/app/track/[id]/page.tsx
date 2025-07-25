import { TrackPageClient } from "@/components/TrackPageClient";
import type { Track } from "@/lib/types";

// In a real app, you would fetch this data from a database based on the `params.id`.
// For this example, we'll use mock data.
const getTrackData = async (id: string): Promise<Track> => {
  // Generate a consistent pseudo-random waveform based on the track ID
  const seedrandom = (seed: string) => {
    let seedVal = 0;
    for(let i = 0; i < seed.length; i++) {
        seedVal += seed.charCodeAt(i);
    }
    const random = () => {
        const x = Math.sin(seedVal++) * 10000;
        return x - Math.floor(x);
    };
    return random;
  }
  const random = seedrandom(id);
  const waveform = Array.from({ length: 100 }, () => Math.round(random() * 100));

  return {
    id,
    title: "Sunset Groove",
    artist: "The Cool Cats",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    waveform,
    comments: [
      { id: "1", author: "Alice", text: "Love the intro, but maybe the kick could be a bit punchier?", timestamp: 10, avatarUrl: "https://placehold.co/40x40.png" },
      { id: "2", author: "Bob", text: "The synth melody starting here is fantastic!", timestamp: 45, avatarUrl: "https://placehold.co/40x40.png" },
    ],
  };
};


export default async function TrackPage({ params }: { params: { id: string } }) {
  const track = await getTrackData(params.id);

  return <TrackPageClient track={track} />;
}
