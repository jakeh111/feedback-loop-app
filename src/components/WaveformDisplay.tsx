"use client";

import React from 'react';
import type { Comment } from '@/lib/types';
import { MessageSquare, GitCommitHorizontal } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface WaveformDisplayProps {
  waveformData: number[];
  progress: number; // 0-100
  comments: Comment[];
  duration: number;
  onWaveformClick: (progress: number) => void;
}

export function WaveformDisplay({ waveformData, progress, comments, duration, onWaveformClick }: WaveformDisplayProps) {
  
  const handleWaveformContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newProgress = x / rect.width;
    onWaveformClick(newProgress);
  };
  
  return (
    <div className="relative">
      <div 
        className="w-full h-28 bg-muted/20 rounded-lg flex items-center justify-center gap-[2px] p-2 cursor-pointer" 
        onClick={handleWaveformContainerClick}
      >
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
            />
          );
        })}
      </div>
      {duration > 0 && comments.map((comment) => {
        if (comment.endTimestamp) {
           // Render a range
           const left = (comment.timestamp / duration) * 100;
           const right = (comment.endTimestamp / duration) * 100;
           const width = right - left;
           return (
             <TooltipProvider key={comment.id}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <div
                            className="absolute top-0 h-full bg-primary/20 hover:bg-primary/40 border-x-2 border-primary/80 cursor-pointer"
                            style={{ left: `${left}%`, width: `${width}%` }}
                            onClick={(e) => { e.stopPropagation(); onWaveformClick(left / 100); }}
                         >
                            <GitCommitHorizontal className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/50"/>
                         </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-semibold">{comment.author}</p>
                        <p>{comment.text}</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
           )
        } else {
            // Render a single marker
            const left = (comment.timestamp / duration) * 100;
            return (
                <TooltipProvider key={comment.id}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div 
                                className="absolute top-0 h-full w-px cursor-pointer group"
                                style={{ left: `${left}%` }}
                                onClick={(e) => { e.stopPropagation(); onWaveformClick(left / 100); }}
                            >
                                <div className="absolute top-0 h-full w-px bg-primary/50 group-hover:w-0.5 group-hover:bg-primary" />
                                <MessageSquare className="absolute -top-2 -translate-x-1/2 w-4 h-4 text-primary fill-primary-foreground" />
                            </div>
                        </TooltipTrigger>
                         <TooltipContent>
                            <p className="font-semibold">{comment.author}</p>
                            <p>{comment.text}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }
      })}
    </div>
  );
}
