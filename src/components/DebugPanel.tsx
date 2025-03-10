import React, { useEffect, useState } from 'react';
import { useKaraokeStore } from '../store/useKaraokeStore';

// Certifique-se de que a exportação seja feita corretamente
export const DebugPanel: React.FC<{ show?: boolean }> = ({ show = true }) => {
  const { isPlayerModalOpen, currentSong } = useKaraokeStore();
  const [timeCheck, setTimeCheck] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeCheck(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div>Modal open: {String(isPlayerModalOpen)}</div>
      <div>Current song: {currentSong?.title || 'None'}</div>
      <div>Time: {new Date(timeCheck).toLocaleTimeString()}</div>
    </div>
  );
};

// Adicionar exportação padrão também, para dar mais flexibilidade na importação
export default DebugPanel;
