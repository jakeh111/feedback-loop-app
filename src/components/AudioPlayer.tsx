
"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import type { Track, Comment } from '@/lib/types';
import { Button } from './ui/button';
import { Play, Pause, Volume2, VolumeX, Rewind, FastForward } from 'lucide-react';
import { Slider } from './ui/slider';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

interface AudioPlayerProps {
  track: Track;
  onTimeUpdate: (time: number) => void;
  comments?: Comment[];
}

export interface AudioPlayerRef {
  seekTo: (time: number) => void;
  wavesurfer: WaveSurfer | null;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({ track, onTimeUpdate, comments = [] }, ref) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useImperativeHandle(ref, () => ({
    seekTo(time: number) {
      if (wavesurferRef.current) {
        wavesurferRef.current.seekTo(time / wavesurferRef.current.getDuration());
        if (!wavesurferRef.current.isPlaying()) {
            wavesurferRef.current.play();
        }
      }
    },
    wavesurfer: wavesurferRef.current,
  }));
  
  const addCommentRegions = useCallback(() => {
    if (!regionsRef.current || !wavesurferRef.current) return;
    
    // Clear existing regions before adding new ones
    regionsRef.current.clearRegions();
    
    comments.forEach(comment => {
      if (comment.endTimestamp) {
        regionsRef.current.addRegion({
          start: comment.timestamp,
          end: comment.endTimestamp,
          content: '',
          color: 'hsla(var(--accent) / 0.2)',
          drag: false,
          resize: false,
        });
      }
    });
  }, [comments]);


  useEffect(() => {
    if (!waveformRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'hsl(var(--secondary))',
      progressColor: 'hsl(var(--primary) / 0.5)',
      cursorColor: 'hsl(var(--accent))',
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      height: 112, // Corresponds to h-28
      url: track.audioUrl,
      normalize: true,
    });
    
    wavesurferRef.current = ws;
    regionsRef.current = ws.registerPlugin(RegionsPlugin.create());


    const subs = [
      ws.on('play', () => setIsPlaying(true)),
      ws.on('pause', () => setIsPlaying(false)),
      ws.on('timeupdate', (time) => {
        setCurrentTime(time)
        onTimeUpdate(time);
      }),
      ws.on('ready', (d) => {
        setDuration(d);
        addCommentRegions();
      }),
       ws.on('decode', (d) => {
        setDuration(d);
        addCommentRegions();
      }),
    ];

    return () => {
      subs.forEach(unsub => unsub());
      ws.destroy();
    };
  }, [track.audioUrl, onTimeUpdate, addCommentRegions]);
  
  useEffect(() => {
    addCommentRegions();
  }, [comments, addCommentRegions]);

  useEffect(() => {
     if (wavesurferRef.current) {
         wavesurferRef.current.setVolume(isMuted ? 0 : volume);
     }
  }, [volume, isMuted])

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  }

  const seek = (amount: number) => {
    if (wavesurferRef.current) {
       const newTime = wavesurferRef.current.getCurrentTime() + amount;
       wavesurferRef.current.seekTo(newTime / duration);
    }
  }

  return (
    <div className="bg-card p-4 rounded-lg border drop-shadow-custom-md">
      <div ref={waveformRef} className="w-full h-28 cursor-pointer" />
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm font-mono text-muted-foreground w-28">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => seek(-10)}><Rewind /></Button>
            <Button variant="default" size="icon" onClick={togglePlayPause} className="w-12 h-12">
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => seek(10)}><FastForward /></Button>
        </div>
        <div className="flex items-center gap-2 w-28">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
            </Button>
            <Slider
                min={0}
                max={1}
                step={0.01}
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
            />
        </div>
      </div>
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';
