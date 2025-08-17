
import { TrackPageClient } from "@/components/TrackPageClient";
import type { Track } from "@/lib/types";
import type { Metadata, ResolvingMetadata } from 'next'
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { notFound } from 'next/navigation';


const getTrackData = async (id: string): Promise<Track | null> => {
  try {
    const trackDocRef = doc(firestore, 'tracks', id);
    const trackSnap = await getDoc(trackDocRef);

    if (!trackSnap.exists()) {
      return null;
    }

    const data = trackSnap.data();

    // In a real app, you might generate or store a real waveform.
    // For now, we'll keep the pseudo-random one for visual purposes.
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
    const randomWaveform = Array.from({ length: 100 }, () => Math.round(random() * 100));


    return {
      id: trackSnap.id,
      title: data.title || "Untitled Track",
      artist: data.artist || "Unknown Artist",
      audioUrl: data.audioUrl,
      waveform: data.waveform && data.waveform.length > 0 ? data.waveform : randomWaveform,
    };
  } catch (error) {
    console.error("Error fetching track data:", error);
    return null;
  }
};

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const track = await getTrackData(params.id)
  
  if (!track) {
    return {
      title: 'Track Not Found'
    }
  }

  return {
    title: `${track.title} by ${track.artist}`,
    description: `Listen to and give feedback on ${track.title} by ${track.artist}.`,
  }
}


export default async function TrackPage({ params }: { params: { id:string } }) {
  const track = await getTrackData(params.id);

  if (!track) {
    notFound();
  }

  return <TrackPageClient track={track} />;
}
