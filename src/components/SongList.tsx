import React from 'react';
import { useKaraokeStore } from '../store/useKaraokeStore';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const SongList: React.FC = () => {
  const { songs, currentSong, setCurrentSong, openPlayerModal } = useKaraokeStore();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => Math.min(songs.length - 1, prev + 1));
    } else if (e.key === 'Enter') {
      setCurrentSong(songs[selectedIndex]);
      openPlayerModal();
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, songs]);

  return (
    <div className="flex h-full">
      <div className="flex flex-col justify-center mr-2">
        <button
          onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronUp size={24} />
        </button>
        <button
          onClick={() => setSelectedIndex((prev) => Math.min(songs.length - 1, prev + 1))}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-5 gap-x-2 px-2">
          {songs.map((song, index) => (
            <div key={song.id} className="pt-2">
              <button
                onClick={() => {
                  console.log("Clicked on song:", song.title);
                  setSelectedIndex(index);
                  setCurrentSong(song);
                  openPlayerModal();
                  console.log("Modal should be open now");
                }}
                className={`relative w-full rounded-lg overflow-hidden transition-transform hover:scale-105 ${
                  currentSong?.id === song.id ? 'ring-2 ring-purple-500' : ''
                } ${selectedIndex === index ? 'ring-2 ring-white' : ''}`}
                style={{ paddingBottom: '100%' }}
              >
                <div className="absolute inset-0">
                  <img
                    src={song.albumCover}
                    alt={`${song.title} - ${song.artist}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2">
                    <p className="text-white text-xs font-semibold truncate">
                      {song.title}
                    </p>
                    <p className="text-gray-300 text-xs truncate">{song.artist}</p>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};