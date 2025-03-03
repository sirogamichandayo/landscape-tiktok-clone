import React, { createContext, useContext, useState, useCallback } from 'react';
import { Video } from '../services/videoService';

interface VideoContextType {
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
  refreshVideos: () => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>([]);

  const refreshVideos = useCallback(() => {
    // This will trigger a re-fetch in the VideoFeed component
    setVideos([]);
  }, []);

  const value = {
    videos,
    setVideos,
    refreshVideos
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};