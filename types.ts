export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  fileUrl: string; // Blob URL for local files or remote URL
  duration: number; // in seconds
  currentTime: number; // in seconds, for resume capability
  lastPlayed: number; // Timestamp for sorting
  isLocal: boolean;
}

export enum PlaybackSpeed {
  X075 = 0.75,
  X100 = 1.0,
  X125 = 1.25,
  X150 = 1.5,
  X200 = 2.0,
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: PlaybackSpeed;
  volume: number;
  sleepTimer: number | null; // Minutes remaining, null if off
}

export interface AIInsight {
  summary: string;
  themes: string[];
  characters: string[];
}
