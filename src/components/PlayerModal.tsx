import React, { useEffect } from 'react';
import { useKaraokeStore } from '../store/useKaraokeStore';
import { SongInfo } from './SongInfo';
import { X } from 'lucide-react';

export const PlayerModal: React.FC = () => {
  const { isPlayerModalOpen, closePlayerModal, currentSong } = useKaraokeStore();

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePlayerModal();
      }
    };

    if (isPlayerModalOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isPlayerModalOpen, closePlayerModal]);

  if (!isPlayerModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            {currentSong ? `${currentSong.title} - ${currentSong.artist}` : 'Player'}
          </h3>
          <button
            onClick={closePlayerModal}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <SongInfo />
        </div>
      </div>
    </div>
  );
};
