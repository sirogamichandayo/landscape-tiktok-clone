import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import VideoPlayer from './VideoPlayer';
import LoadingSpinner from './LoadingSpinner';
import { fetchVideos } from '../services/videoService';
import { useVideo } from '../contexts/VideoContext';

const FeedContainer = styled.div<{ hasVideos: boolean }>`
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  background-color: black;
  padding-top: 60px; // Account for navigation bar

  @media (orientation: landscape) {
    padding-top: 0; // Remove padding in landscape mode since nav is auto-hidden
  }

  // Scrollbar styling
  &::-webkit-scrollbar {
    width: 8px;
    background-color: transparent;
    display: ${props => props.hasVideos ? 'block' : 'none'};
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 4px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.6);
    }
  }

  // Firefox scrollbar styling
  scrollbar-width: ${props => props.hasVideos ? 'thin' : 'none'};
  scrollbar-color: rgba(255, 255, 255, 0.4) transparent;
`;

const MessageContainer = styled.div`
  height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const ErrorMessage = styled.div`
  color: #FE2C55;
  text-align: center;
  padding: 20px;
  font-size: 18px;
  max-width: 80%;
  margin: 0 auto;

  button {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: #FE2C55;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #FF4D6A;
    }
  }
`;

const VideoFeed: React.FC = () => {
  const { videos, setVideos } = useVideo();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedVideos = await fetchVideos(10);
      setVideos(fetchedVideos);
    } catch (err) {
      setError('Failed to load videos. Please try again later.');
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setVideos]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  if (loading) {
    return (
      <MessageContainer>
        <LoadingSpinner size="large" />
      </MessageContainer>
    );
  }

  if (error) {
    return (
      <MessageContainer>
        <ErrorMessage>
          {error}
          <button onClick={loadVideos}>Try Again</button>
        </ErrorMessage>
      </MessageContainer>
    );
  }

  return (
    <FeedContainer hasVideos={videos.length > 0}>
      {videos.map((video) => (
        <VideoPlayer
          key={video.id}
          url={video.url}
          description={video.description}
          username={video.username}
          likes={video.likes}
          comments={video.comments}
          shares={video.shares}
        />
      ))}
      {videos.length === 0 && (
        <MessageContainer>
          <div>No videos available</div>
        </MessageContainer>
      )}
    </FeedContainer>
  );
};

export default VideoFeed;
