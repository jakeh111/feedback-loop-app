
"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { Track, Comment } from '@/lib/types';
import { Button } from './ui/button';
import { Play, Pause, Volume2, VolumeX, Rewind, FastForward } from 'lucide-react';
import { Slider } from './ui/slider';
import { WaveformDisplay } from './WaveformDisplay';


interface AudioPlayerProps {
  track: Track;
  comments: Comment[];
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onCommentActive: (comment: Comment | null) => void;
}

export interface AudioPlayerRef {
  seekTo: (time: number) => void;
  audioEl: HTMLAudioElement | null;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({ track, comments, onTimeUpdate, onDurationChange, onCommentActive }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Debug lines
  console.log('Full track object:', track);
  console.log('Waveform data:', track.waveform);


  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      onTimeUpdate(time);
      setProgress((time / audio.duration) * 100);

      // Check for active comment
      let activeComment: Comment | null = null;
      for (const comment of comments) {
        const start = comment.timestamp;
        // For single comments, give a 2-second window. For ranges, use the range.
        const end = comment.endTimestamp ?? (start + 2);
        if (time >= start && time <= end) {
          activeComment = comment;
          break; 
        }
      }
      onCommentActive(activeComment);

    };

    const handleDurationChange = () => {
        if (isFinite(audio.duration)) {
            setDuration(audio.duration);
            onDurationChange(audio.duration);
        }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);


    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]); // Add comments to dependency array
  

  useImperativeHandle(ref, () => ({
    seekTo(time: number) {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        if (audioRef.current.paused) {
          audioRef.current.play();
        }
      }
    },
    audioEl: audioRef.current,
  }));
  
  useEffect(() => {
     if (audioRef.current) {
         audioRef.current.volume = isMuted ? 0 : volume;
     }
  }, [volume, isMuted])

  const togglePlayPause = () => {
    if (audioRef.current) {
        if (audioRef.current.paused) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
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
    if (audioRef.current) {
       audioRef.current.currentTime += amount;
    }
  }

  const handleWaveformClick = (newProgress: number) => {
     if (audioRef.current && isFinite(duration)) {
        audioRef.current.currentTime = duration * newProgress;
     }
  }

  return (
    <div className="bg-card p-4 rounded-lg border drop-shadow-custom-md">
      <audio ref={audioRef} src={track.audioUrl} preload="metadata" />
      <WaveformDisplay 
        waveformData={track.waveform || []} 
        progress={progress} 
        onWaveformClick={handleWaveformClick}
        comments={comments}
        duration={duration}
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
