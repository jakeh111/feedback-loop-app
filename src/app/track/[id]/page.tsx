

import { TrackPageClient } from "@/components/TrackPageClient";
import type { Track } from "@/lib/types";
import type { Metadata, ResolvingMetadata } from 'next'
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { notFound } from 'next/navigation';

const getSampleTrack = (): Track => {
  const waveformData = Array.from({ length: 200 }, () => Math.floor(Math.random() * 75) + 5);
  return {
    id: 'sample',
    title: 'Sample Track - My Masterpiece',
    artist: 'Sample Artist',
    audioUrl: 'https://storage.googleapis.com/studioprod-exports-prod/supported_output_formats/12-second-of-silence.mp3', // A silent mp3 file for placeholder
    userId: 'sample-user',
    waveform: waveformData,
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

    return {
      id: trackSnap.id,
      title: data.title || "Untitled Track",
      artist: data.artist || "Unknown Artist",
      audioUrl: data.audioUrl,
      userId: data.userId,
      waveform: data.waveform || [],
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
