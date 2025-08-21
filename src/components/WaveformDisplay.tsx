
"use client";

import React from 'react';

interface WaveformDisplayProps {
  waveformData: number[];
  progress: number; // 0-100
  onWaveformClick: (progress: number) => void;
}

export function WaveformDisplay({ waveformData, progress, onWaveformClick }: WaveformDisplayProps) {
  const handleBarClick = (index: number) => {
    const newProgress = ((index + 0.5) / waveformData.length);
    onWaveformClick(newProgress);
  };
  
  return (
    <div className="w-full h-28 bg-muted/20 rounded-lg flex items-center justify-center gap-px p-2 cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newProgress = x / rect.width;
        onWaveformClick(newProgress);
    }}>
      {waveformData.map((bar, index) => {
        const isPlayed = (index / waveformData.length) * 100 < progress;
        return (
          <div
            key={index}
            className="w-full rounded-full transition-colors duration-75"
            style={{
              height: `${Math.max(bar, 2)}%`,
              backgroundColor: isPlayed ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
            }}
            onClick={(e) => {
                e.stopPropagation();
                handleBarClick(index);
            }}
          />
        );
      })}
    </div>
  );
}

    