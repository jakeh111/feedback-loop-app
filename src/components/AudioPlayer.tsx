
"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { Track, Comment } from '@/lib/types';
import { Waveform } from './Waveform';
import { Button } from './ui/button';
import { Play, Pause, Volume2, VolumeX, Rewind, FastForward } from 'lucide-react';
import { Slider } from './ui/slider';

interface AudioPlayerProps {
  track: Track;
  onTimeUpdate: (time: number) => void;
  comments?: Comment[];
}

export interface AudioPlayerRef {
  seekTo: (time: number) => void;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({ track, onTimeUpdate, comments = [] }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  
  useImperativeHandle(ref, () => ({
    seekTo(time: number) {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        if (audioRef.current.paused) {
          audioRef.current.play();
        }
      }
    }
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    }

    const setAudioTime = () => {
        const currentTime = audio.currentTime;
        setCurrentTime(currentTime);
        onTimeUpdate(currentTime);
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // This is important to ensure volume is set correctly on mount
    audio.volume = isMuted ? 0 : volume;

    // When the component unmounts, remove the event listeners
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    }
  }, [track.audioUrl, volume, isMuted, onTimeUpdate]); // Depend on track.audioUrl to re-run if it changes

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }
  };

  const handleManualSeek = (time: number) => {
    const audio = audioRef.current;
    if (audio && isFinite(time)) {
        audio.currentTime = time;
        setCurrentTime(time);
        onTimeUpdate(time);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    const audio = audioRef.current;
    if(audio) {
      audio.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      setIsMuted(false);
      audio.volume = volume;
    } else {
      setIsMuted(true);
      audio.volume = 0;
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const seek = (amount: number) => {
    const audio = audioRef.current;
    if (audio) {
        const newTime = audio.currentTime + amount;
        handleManualSeek(Math.max(0, Math.min(duration, newTime)));
    }
  }

  return (
    <div className="bg-card p-4 rounded-lg border drop-shadow-custom-md">
      {track.audioUrl && <audio ref={audioRef} src={track.audioUrl} preload="metadata" />}
      <Waveform
        data={track.waveform}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleManualSeek}
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
