

import { TrackPageClient } from "@/components/TrackPageClient";
import type { Track } from "@/lib/types";
import type { Metadata, ResolvingMetadata } from 'next'
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { notFound } from 'next/navigation';

const getSampleTrack = (): Track => {
  return {
    id: 'sample',
    title: 'Sample Track - My Masterpiece',
    artist: 'Sample Artist',
    audioUrl: 'https://storage.googleapis.com/studioprod-exports-prod/supported_output_formats/12-second-of-silence.mp3', // A silent mp3 file for placeholder
    waveform: Array.from({ length: 100 }, (_, i) => Math.round(Math.sin(i * Math.PI / 25) * 40 + 50)),
    userId: 'sample-user',
  };
};

const getTrackData = async (id: string): Promise<Track | null> => {
  if (id === 'sample') {
    return getSampleTrack();
  }
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
      userId: data.userId,
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
