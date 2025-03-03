import React, { useRef, useState } from 'react';
import styled from 'styled-components';

interface VideoPlayerProps {
  url: string;
  description: string;
  username: string;
  likes: number;
  comments: number;
  shares: number;
}

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: black;
  scroll-snap-align: start;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    height: calc(100vh - 60px);
  }

  @media (orientation: landscape) and (max-height: 600px) {
    height: 100vh;
    padding: 0 15%;
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 100vh;

  @media (orientation: landscape) {
    max-width: 100%;
    max-height: 90vh;
  }
`;

const VideoInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  z-index: 1;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  max-width: 60%;

  @media (max-width: 768px) {
    bottom: 80px;
    max-width: 80%;
  }

  h3 {
    font-size: 1.2rem;
    margin-bottom: 8px;

    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }

  p {
    font-size: 1rem;
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
`;

const VideoActions = styled.div`
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: white;
  z-index: 1;

  @media (max-width: 768px) {
    bottom: 80px;
  }

  @media (orientation: landscape) and (max-height: 600px) {
    right: 5%;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  
  span:first-child {
    font-size: 24px;
    
    @media (max-width: 480px) {
      font-size: 20px;
    }
  }

  span:last-child {
    font-size: 14px;
    
    @media (max-width: 480px) {
      font-size: 12px;
    }
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  description,
  username,
  likes,
  comments,
  shares,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <VideoContainer onClick={togglePlay}>
      <Video
        ref={videoRef}
        src={url}
        loop
        playsInline
      />
      <VideoInfo>
        <h3>@{username}</h3>
        <p>{description}</p>
      </VideoInfo>
      <VideoActions>
        <ActionButton>
          <span>❤️</span>
          <span>{likes}</span>
        </ActionButton>
        <ActionButton>
          <span>💬</span>
          <span>{comments}</span>
        </ActionButton>
        <ActionButton>
          <span>↗️</span>
          <span>{shares}</span>
        </ActionButton>
      </VideoActions>
    </VideoContainer>
  );
};

export default VideoPlayer;