"use client";

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import type { Track, Comment } from '@/lib/types';
import { Waveform } from './Waveform';
import { Button } from './ui/button';
import { Play, Pause, Volume2, VolumeX, Rewind, FastForward } from 'lucide-react';
import { Slider } from './ui/slider';

interface AudioPlayerProps {
  track: Track;
  onSeek: (time: number) => void;
  comments?: Comment[];
}

export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(({ track, onSeek, comments = [] }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  // This function allows us to get the audio element from the ref
  const getAudioElement = (): HTMLAudioElement | null => {
    if (ref && 'current' in ref) {
      return ref.current;
    }
    return null;
  };


  useEffect(() => {
    const audio = getAudioElement();
    if (!audio) return;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    audio.volume = isMuted ? 0 : volume;

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    }
  }, [ref, volume, isMuted]);

  const togglePlayPause = () => {
    const audio = getAudioElement();
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }
  };

  const handleSeek = (time: number) => {
    const audio = getAudioElement();
    if (audio) {
        audio.currentTime = time;
        setCurrentTime(time);
        onSeek(time);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    const audio = getAudioElement();
    if(audio) {
      audio.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const audio = getAudioElement();
    if(audio) {
      audio.volume = !isMuted ? 0 : volume;
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const seek = (amount: number) => {
    const audio = getAudioElement();
    if (audio) {
        const newTime = audio.currentTime + amount;
        handleSeek(Math.max(0, Math.min(duration, newTime)));
    }
  }

  return (
    <div className="bg-card p-4 rounded-lg border drop-shadow-custom-md">
      {track.audioUrl && <audio ref={ref} src={track.audioUrl} preload="metadata" />}
      <Waveform
        data={track.waveform}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        isPlaying={isPlaying}
        comments={comments}
      />
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
