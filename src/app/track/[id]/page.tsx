import { TrackPageClient } from "@/components/TrackPageClient";
import type { Track } from "@/lib/types";
import type { Metadata, ResolvingMetadata } from 'next'

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
    title: "Quantum Leap",
    artist: "SynthWave Surfer",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    waveform,
    comments: [
        { id: "1", author: "ProducerPro", text: "The main synth riff is great, but the kick drum feels a bit weak throughout this section. It could use more low-end punch.", timestamp: 5, endTimestamp: 20, avatarUrl: "https://placehold.co/40x40.png?text=P" },
        { id: "2", author: "MixMasterMike", text: "The transition here is a little abrupt. Maybe a filter sweep or a reverse cymbal would smooth it out.", timestamp: 28, avatarUrl: "https://placehold.co/40x40.png?text=M" },
        { id: "3", author: "VocalVibes", text: "The harmony vocals from here to the end of the phrase are slightly off-key. They need a little pitch correction.", timestamp: 45, endTimestamp: 52, avatarUrl: "https://placehold.co/40x40.png?text=V" },
        { id: "4", author: "BassHead", text: "The bassline is fantastic in this part! Really driving the track forward.", timestamp: 60, avatarUrl: "https://placehold.co/40x40.png?text=B" },
        { id: "5", author: "ProducerPro", text: "Considering the whole section, the snare could use a bit more reverb to give it more space in the mix.", timestamp: 60, endTimestamp: 80, avatarUrl: "https://placehold.co/40x40.png?text=P" }
      ],
  };
};

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const track = await getTrackData(params.id)
 
  return {
    title: `${track.title} by ${track.artist}`,
    description: `Listen to and give feedback on ${track.title} by ${track.artist}.`,
  }
}


export default async function TrackPage({ params }: { params: { id: string } }) {
  const track = await getTrackData(params.id);

  return <TrackPageClient track={track} />;
}
