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
    title: "Cosmic Drift (Mix v2)",
    artist: "Stellar Beatz",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    waveform,
    comments: [
      { id: "1", author: "Alice", text: "Love the intro, but maybe the kick could be a bit punchier?", timestamp: 10, avatarUrl: "https://placehold.co/40x40.png?text=A" },
      { id: "2", author: "Bob", text: "The synth melody starting here is fantastic!", timestamp: 45, avatarUrl: "https://placehold.co/40x40.png?text=B" },
      { id: "3", author: "Carlos", text: "The reverb on the snare feels a little too long in this section. Maybe shorten the decay?", timestamp: 22, avatarUrl: "https://placehold.co/40x40.png?text=C" },
      { id: "4", author: "Diana", text: "This drop is epic! The bass really comes through nicely.", timestamp: 85, avatarUrl: "https://placehold.co/40x40.png?text=D" },
      { id: "5", author: "Alice", text: "Following up on my earlier comment, I tried a little EQ boost around 60Hz on the kick and it sounds great.", timestamp: 12, avatarUrl: "https://placehold.co/40x40.png?text=A" },
    ],
  };
};


export default async function TrackPage({ params }: { params: { id: string } }) {
  const track = await getTrackData(params.id);

  return <TrackPageClient track={track} />;
}
