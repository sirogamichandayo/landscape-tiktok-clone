import React, { useRef, useState, useEffect } from 'react';
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

const SeekBarContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 30px 20px 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;

  ${VideoContainer}:hover & {
    opacity: 1;
    pointer-events: auto;
  }
`;

const SeekBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 10px;
  border-radius: 2px;
  transform-origin: center;

  &:hover {
    height: 6px;
    transform: scaleY(1.2);
    background-color: rgba(255, 255, 255, 0.4);
  }
`;

const Progress = styled.div<{ width: string; isDragging?: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: ${props => props.isDragging ? '#ff6666' : '#ff4444'};
  width: ${props => props.width};
  transition: background-color 0.2s ease;
  border-radius: 2px;

  &::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%) scale(${props => props.isDragging ? 1 : 0});
    width: 12px;
    height: 12px;
    background-color: ${props => props.isDragging ? '#ff6666' : '#ff4444'};
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: ${props => props.isDragging ? 1 : 0};
  }

  ${SeekBar}:hover & {
    background-color: #ff6666;
    box-shadow: 0 0 8px rgba(255, 102, 102, 0.3);

    &::after {
      transform: translateY(-50%) scale(1);
      opacity: 1;
      box-shadow: 0 0 8px rgba(255, 102, 102, 0.5);
    }
  }
`;

const TimeDisplay = styled.div`
  position: absolute;
  right: 20px;
  bottom: 35px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0.9;
  letter-spacing: 0.5px;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (!isDragging && videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      const progress = (current / total) * 100;
      requestAnimationFrame(() => {
        setProgress(progress);
        setCurrentTime(current);
        setDuration(total);
      });
    }
  };

  const calculateSeekPosition = (clientX: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const seekPosition = calculateSeekPosition(e.clientX, e.currentTarget);
      videoRef.current.currentTime = videoRef.current.duration * seekPosition;
    }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDrag = (e: MouseEvent) => {
    if (isDragging && videoRef.current) {
      const seekBar = document.querySelector<HTMLElement>('.seek-bar');
      if (seekBar) {
        requestAnimationFrame(() => {
          const seekPosition = calculateSeekPosition(e.clientX, seekBar);
          setProgress(seekPosition * 100);
          const newTime = seekPosition * videoRef.current!.duration;
          videoRef.current!.currentTime = newTime;
        });
      }
    }
  };

  const handleDragEnd = () => {
    if (isDragging && videoRef.current) {
      requestAnimationFrame(() => {
        const newTime = (progress / 100) * videoRef.current.duration;
        videoRef.current!.currentTime = newTime;
        setIsDragging(false);
      });
    }
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    const containerElement = containerRef.current;

    if (!videoElement || !containerElement) return;

    // Add timeupdate event listener
    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoElement.play()
              .then(() => setIsPlaying(true))
              .catch((error) => {
                console.error("Error playing video:", error);
              });
          } else {
            videoElement.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: 0.5 // 50% of the video is visible
      }
    );

    observer.observe(containerElement);

    return () => {
      observer.unobserve(containerElement);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.pause();
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((error) => console.error("Error playing video:", error));
      }
    }
  };

  return (
    <VideoContainer ref={containerRef} onClick={togglePlay}>
      <Video
        ref={videoRef}
        src={url}
        loop
        playsInline
        autoPlay
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
      <SeekBarContainer>
        <SeekBar
          className="seek-bar"
          onClick={handleSeek}
          onMouseDown={handleDragStart}>
          <Progress 
            width={`${Number(progress.toFixed(4))}%`}
            isDragging={isDragging}
          />
        </SeekBar>
        <TimeDisplay>
          {formatTime(currentTime)} / {formatTime(duration)}
        </TimeDisplay>
      </SeekBarContainer>
    </VideoContainer>
  );
};

export default VideoPlayer;
