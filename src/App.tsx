import { useEffect } from 'react';
import { SongInfo } from './components/SongInfo';
import { SongList } from './components/SongList';
import { SearchBar } from './components/SearchBar';
import { DebugPanel } from './components/DebugPanel';
import { Modal } from './components/Modal';
import { useKaraokeStore } from './store/useKaraokeStore';
import { Sun, Moon } from 'lucide-react';

function App() {
  const { 
    theme, 
    toggleTheme,
    isPlayerModalOpen, 
    closePlayerModal,
    currentSong,
    openPlayerModal,
    refreshSongs,
    isLoading
  } = useKaraokeStore();

  // Load songs when the application starts
  useEffect(() => {
    // Use the new refreshSongs function to detect all songs in the directory
    refreshSongs();
    
    // Set up an interval to check for new songs every minute (60000ms)
    const intervalId = setInterval(() => {
      refreshSongs();
    }, 60000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [refreshSongs]);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto p-4 h-screen flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">SingStarWeb</h1>
            <div className="flex gap-2">
              {isLoading && (
                <span className="px-4 py-2 bg-yellow-600 text-white rounded">
                  Carregando músicas...
                </span>
              )}
              <button
                onClick={refreshSongs}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Atualizar Músicas
              </button>
              <button
                onClick={openPlayerModal}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Abrir Player
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="col-span-1">
              {currentSong ? (
                <div className="bg-gray-900 p-4 rounded-lg flex flex-col h-full">
                  <img 
                    src={currentSong.albumCover} 
                    alt={`${currentSong.title} cover`}
                    className="w-full aspect-square object-cover rounded-lg mb-4" 
                  />
                  <h3 className="text-xl font-semibold text-white truncate">{currentSong.title}</h3>
                  <p className="text-gray-400 truncate">{currentSong.artist}</p>
                  
                  <button 
                    onClick={() => {
                      console.log("Opening player modal from App");
                      openPlayerModal();
                    }}
                    className="mt-4 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                  >
                    Abrir Player
                  </button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Selecione uma música para começar</p>
                </div>
              )}
            </div>
            <div className="col-span-2 bg-gray-800 rounded-lg overflow-hidden">
              <SongList />
            </div>
          </div>

          <div className="w-full max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        <DebugPanel show={true} />

        {/* Modal do player */}
        {isPlayerModalOpen && (
          <Modal 
            isOpen={true}
            onClose={closePlayerModal}
            title={currentSong ? `${currentSong.title} - ${currentSong.artist}` : 'Player'}
          >
            <SongInfo />
          </Modal>
        )}
      </div>
    </div>
  );
}

export default App;