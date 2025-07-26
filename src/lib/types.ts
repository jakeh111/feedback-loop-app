export type Comment = {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  endTimestamp?: number;
  avatarUrl: string;
  youtubeUrl?: string;
  youtubeTimestamp?: number;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  waveform: number[];
  comments: Comment[];
};
