import { create } from 'zustand';
import type { Song, UserScore } from '../types/song';

interface KaraokeState {
  currentSong: Song | null;
  songs: Song[];
  userScores: UserScore[];
  isPlaying: boolean;
  volume: {
    music: number;
    voice: number;
  };
  theme: 'light' | 'dark';
  setCurrentSong: (song: Song | null) => void;
  setSongs: (songs: Song[]) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (type: 'music' | 'voice', value: number) => void;
  toggleTheme: () => void;
  addScore: (score: UserScore) => void;
}

export const useKaraokeStore = create<KaraokeState>((set) => ({
  currentSong: null,
  songs: [],
  userScores: [],
  isPlaying: false,
  volume: {
    music: 0.8,
    voice: 1.0,
  },
  theme: 'dark',
  setCurrentSong: (song) => set({ currentSong: song }),
  setSongs: (songs) => set({ songs }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (type, value) =>
    set((state) => ({
      volume: {
        ...state.volume,
        [type]: value,
      },
    })),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
  addScore: (score) =>
    set((state) => ({
      userScores: [...state.userScores, score],
    })),
}));