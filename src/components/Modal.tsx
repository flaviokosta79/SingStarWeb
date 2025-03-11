import React, { useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useKaraokeStore } from '../store/useKaraokeStore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children,
  title
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { modalSize, adjustModalSize } = useKaraokeStore();

  // Handle ESC key to close modal
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  // Base width multiplicado pelo modalSize
  const baseWidth = 40; // 40rem = 640px
  const currentWidth = Math.round(baseWidth * modalSize);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        style={{ maxWidth: `${currentWidth}rem` }}
        className="bg-gray-800 rounded-lg shadow-xl w-full max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">{title || 'Player'}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustModalSize(-0.1)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
              title="Diminuir tamanho"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={() => adjustModalSize(0.1)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
              title="Aumentar tamanho"
            >
              <ZoomIn size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
