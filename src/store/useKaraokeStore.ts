import { create } from 'zustand';
import type { Song, UserScore } from '../types/song';
import { loadSongsFromFileSystem, saveSongsData } from '../utils/songLoader';

interface KaraokeState {
  currentSong: Song | null;
  songs: Song[];
  userScores: UserScore[];
  isPlaying: boolean;
  isPlayerModalOpen: boolean;
  volume: {
    music: number;
    voice: number;
  };
  theme: 'light' | 'dark';
  isLoading: boolean;
  setCurrentSong: (song: Song | null) => void;
  setSongs: (songs: Song[]) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (type: 'music' | 'voice', value: number) => void;
  toggleTheme: () => void;
  addScore: (score: UserScore) => void;
  openPlayerModal: () => void;
  closePlayerModal: () => void;
  refreshSongs: () => Promise<void>;
}

export const useKaraokeStore = create<KaraokeState>((set, get) => ({
  currentSong: null,
  songs: [],
  userScores: [],
  isPlaying: false,
  isPlayerModalOpen: false,
  isLoading: false,
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
  openPlayerModal: () => {
    console.log("Opening player modal"); 
    set({ isPlayerModalOpen: true });
  },
  closePlayerModal: () => {
    console.log("Closing player modal"); 
    set({ isPlayerModalOpen: false });
  },
  refreshSongs: async () => {
    try {
      set({ isLoading: true });
      const songs = await loadSongsFromFileSystem();
      set({ songs });

      // Persiste os dados de volta para o arquivo songs.json para manter atualizado
      const currentSongs = get().songs;
      if (currentSongs.length > 0) {
        try {
          await saveSongsData(currentSongs);
        } catch (error) {
          console.error('Erro ao salvar dados das músicas:', error);
        }
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Erro ao atualizar músicas:', error);
      set({ isLoading: false });
    }
  }
}));