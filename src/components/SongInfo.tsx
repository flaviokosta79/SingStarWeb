import React, { useRef, useEffect, useState } from 'react';
import { useKaraokeStore } from '../store/useKaraokeStore';
import { Volume2, VolumeX } from 'lucide-react';

export const SongInfo: React.FC = () => {
  const { currentSong, volume, setVolume, isPlaying, setIsPlaying } = useKaraokeStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const vocalsRef = useRef<HTMLAudioElement>(null);
  const [videoError, setVideoError] = useState(false);

  // Effect to update audio/video volumes when store volume changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume.music;
    }
    if (musicRef.current) {
      musicRef.current.volume = volume.music;
    }
  }, [volume.music]);

  // Effect to update vocals volume when it changes
  useEffect(() => {
    if (vocalsRef.current) {
      vocalsRef.current.volume = volume.voice;
    }
  }, [volume.voice]);
  
  // Reset video error state when current song changes
  useEffect(() => {
    setVideoError(false);
  }, [currentSong]);

  // Synchronize playback of video and audio tracks
  useEffect(() => {
    if (!currentSong) return;

    const video = videoRef.current;
    const music = musicRef.current;
    const vocals = vocalsRef.current;

    // Function to sync play state
    const syncPlay = () => {
      if (video && video.paused) {
        setIsPlaying(false);
        if (music) music.pause();
        if (vocals) vocals.pause();
      } else {
        setIsPlaying(true);
        if (music) music.play().catch(err => console.error('Error playing music track:', err));
        if (vocals) vocals.play().catch(err => console.error('Error playing vocals track:', err));
      }
    };

    // Function to sync current time
    const syncTime = () => {
      if (video) {
        if (music) music.currentTime = video.currentTime;
        if (vocals) vocals.currentTime = video.currentTime;
      }
    };

    // Add event listeners for video
    if (video) {
      video.addEventListener('play', syncPlay);
      video.addEventListener('pause', syncPlay);
      video.addEventListener('seeked', syncTime);
    }

    return () => {
      // Clean up event listeners
      if (video) {
        video.removeEventListener('play', syncPlay);
        video.removeEventListener('pause', syncPlay);
        video.removeEventListener('seeked', syncTime);
      }
    };
  }, [currentSong, setIsPlaying]);

  if (!currentSong) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>Selecione uma música para começar</p>
      </div>
    );
  }

  // Function to handle video format issues
  const handleVideoError = () => {
    console.error('Video format not supported:', currentSong.videoUrl);
    setVideoError(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 p-4 rounded-lg">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
        {currentSong.videoUrl && !videoError ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            autoPlay
            controlsList="nodownload"
            onError={handleVideoError}
          >
            <source src={currentSong.videoUrl} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-800">
            <img 
              src={currentSong.albumCover} 
              alt={`${currentSong.title} cover`} 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        {videoError && currentSong.videoUrl && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 text-center">
            Formato de vídeo não suportado pelo navegador (.avi). Use um formato compatível como MP4 ou WebM.
          </div>
        )}
      </div>

      {/* Hidden audio elements for music and vocals tracks */}
      <audio ref={musicRef} src={currentSong.musicUrl} preload="auto" />
      <audio ref={vocalsRef} src={currentSong.vocalsUrl} preload="auto" />

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white">{currentSong.title}</h2>
        <p className="text-gray-400">{currentSong.artist}</p>
        <p className="text-gray-500">{currentSong.year}</p>
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-4 mb-2">
          <Volume2 className="text-gray-400" size={20} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume.music}
            onChange={(e) => setVolume('music', Number(e.target.value))}
            className="w-full"
          />
          <span className="text-gray-400 text-xs">Música</span>
        </div>
        <div className="flex items-center gap-4">
          <VolumeX className="text-gray-400" size={20} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume.voice}
            onChange={(e) => setVolume('voice', Number(e.target.value))}
            className="w-full"
          />
          <span className="text-gray-400 text-xs">Voz</span>
        </div>
      </div>
    </div>
  );
};