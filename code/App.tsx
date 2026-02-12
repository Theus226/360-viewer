import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, Minimize2, Maximize2 } from 'lucide-react';
import Scene from './components/Scene';
import './index.css';

// Type for window API
interface WindowAPI {
  electronAPI?: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
}

declare const window: Window & WindowAPI;

// Minimalist titlebar component for Electron - only shown in Electron
const TitleBar: React.FC = () => {
  const isElectron = window.electronAPI !== undefined;
  if (!isElectron) return null;
  return null; // Using native Windows titlebar now
};

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Passo 3: Memory Management & Drag-Drop Logic ---

  // Cleans up the ObjectURL to prevent memory leaks in the browser
  const cleanupUrl = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
  }, [imageUrl]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, solte apenas arquivos de imagem.');
        return;
      }

      // Dispose previous texture/url before creating a new one
      cleanupUrl();
      
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    }
  }, [cleanupUrl]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Shortcuts: ESC or R to reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'r') {
        cleanupUrl();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cleanupUrl]);

  return (
    <div 
      className={`relative w-screen h-screen overflow-hidden transition-colors duration-300 ${
        isDragging ? 'bg-surface' : 'bg-background'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* TitleBar (removed - using native Windows titlebar) */}
      <TitleBar />

      {/* State: Vazio / Dragging */}
      {!imageUrl && (
        <div className="flex flex-col items-center justify-center h-full pointer-events-none select-none p-4">
          <div className={`transition-all duration-500 transform ${isDragging ? 'scale-110 text-primary' : 'text-gray-500'}`}>
             {isDragging ? <UploadCloud size={64} /> : <ImageIcon size={64} />}
          </div>
          <h1 className="mt-6 text-2xl md:text-3xl font-light tracking-wider text-gray-300">
            {isDragging ? 'Solte para visualizar' : 'Arraste seu Render 360 aqui'}
          </h1>
          <p className="mt-2 text-sm text-gray-600 font-mono">
            .JPG .PNG .HDR .WEBP
          </p>
          {error && (
            <p className="mt-4 text-red-500 animate-pulse">{error}</p>
          )}
        </div>
      )}

      {/* State: Carregado */}
      {imageUrl && (
        <div className="absolute inset-0 z-10" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <Scene imageUrl={imageUrl} />
          
          {/* Close Button */}
          <div className="absolute top-14 right-6 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
             <button 
               onClick={cleanupUrl}
               className="bg-black/20 hover:bg-black/50 backdrop-blur-md text-white p-2 rounded-full transition-all"
               title="Fechar (ESC)"
             >
               <X size={20} />
             </button>
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-30 text-xs font-mono text-white">
             [ESC] to Reset • Drag to Rotate • Scroll to Zoom
          </div>
        </div>
      )}
    </div>
  );
}