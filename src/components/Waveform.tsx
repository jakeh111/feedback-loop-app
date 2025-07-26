"use client";

import React, { useRef } from 'react';

interface WaveformProps {
  data: number[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
}

export function Waveform({ data, currentTime, duration, onSeek, isPlaying }: WaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (waveformRef.current && duration > 0) {
      const rect = waveformRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = (clickX / rect.width);
      onSeek(percentage * duration);
    }
  };

  return (
    <div
      ref={waveformRef}
      className="relative h-24 bg-muted rounded-md cursor-pointer"
      onClick={handleWaveformClick}
    >
      <div className="absolute top-0 left-0 w-full h-full flex items-center gap-px overflow-hidden">
        {data.map((val, i) => (
          <div
            key={i}
            className="w-full bg-secondary rounded-sm"
            style={{ height: `${val}%` }}
          />
        ))}
      </div>
      <div 
        className="absolute top-0 left-0 h-full bg-primary/30"
        style={{ width: `${progress}%`}}
      >
        <div className="absolute top-0 left-0 w-full h-full flex items-center gap-px overflow-hidden">
            {data.map((val, i) => (
              <div
                key={i}
                className="w-full bg-primary rounded-sm"
                style={{ height: `${val}%` }}
              />
            ))}
        </div>
      </div>
       <div 
        className="absolute top-0 h-full w-0.5 bg-accent"
        style={{ left: `${progress}%` }}
      >
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent border-2 border-background" />
       </div>
    </div>
  );
}
