import React, { useEffect } from 'react';
import { SongInfo } from './components/SongInfo';
import { SongList } from './components/SongList';
import { SearchBar } from './components/SearchBar';
import { useKaraokeStore } from './store/useKaraokeStore';
import { Sun, Moon } from 'lucide-react';
import { loadSongsFromFileSystem } from './utils/songLoader';

function App() {
  const { theme, toggleTheme, setSongs } = useKaraokeStore();

  // Load songs when the application starts
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const songs = await loadSongsFromFileSystem();
        setSongs(songs);
        console.log('Loaded songs:', songs);
      } catch (error) {
        console.error('Failed to load songs:', error);
      }
    };

    loadSongs();
  }, [setSongs]);

  const handleSearch = (query: string) => {
    // Implement search logic here
    console.log('Searching for:', query);
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto p-4 h-screen flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">KaraokeStar</h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <SongInfo />
            </div>
            <div className="col-span-2 bg-gray-800 rounded-lg overflow-hidden">
              <SongList />
            </div>
          </div>

          <div className="w-full max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;