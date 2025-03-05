import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { MdFavorite, MdChat, MdShare, MdPerson, MdAccountCircle } from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToComments } from '../services/commentService';
import CommentSection from './CommentSection';

interface VideoPlayerProps {
  id: string;
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
    padding: 0 5%;
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 100vh;

  @media (orientation: landscape) {
    max-width: 100%;
    max-height: 100vh;
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
  bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: white;
  z-index: 1;

  @media (max-width: 768px) {
    bottom: 140px;
  }

  @media (orientation: landscape) and (max-height: 600px) {
    right: 5%;
    bottom: 80px;
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
  pointer-events: auto;
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
  transition: ${props => props.isDragging ? 'none' : 'width 0.1s ease-out, background-color 0.2s ease'};
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

const ProfileImage = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));

  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
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
  transition: all 0.2s ease;

  .icon {
    font-size: 28px;
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));

    @media (max-width: 480px) {
      font-size: 24px;
    }
  }

  .count {
    font-size: 14px;

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }

  &:hover {
    transform: scale(1.1);
    color: #FE2C55;
  }
`;

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  id,
  url,
  description,
  username,
  likes,
  comments: initialComments,
  shares,
}) => {
  const { currentUser, signInWithGoogle, signOut } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(initialComments);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = subscribeToComments(id, (comments) => {
      setCommentCount(comments.length);
    });

    return () => unsubscribe();
  }, [id]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = useCallback(() => {
    if (!isDragging && videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (!isNaN(total) && total > 0) {
        const newProgress = (current / total) * 100;
        setProgress(newProgress);
        setCurrentTime(current);
        setDuration(total);
      }
    }
  }, [isDragging]);

  const calculateSeekPosition = (clientX: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const seekPosition = calculateSeekPosition(e.clientX, e.currentTarget);
      const newProgress = seekPosition * 100;
      const newTime = seekPosition * videoRef.current.duration;

      // Update both progress and video time synchronously
      setProgress(newProgress);
      videoRef.current.currentTime = newTime;
    }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDrag = (e: MouseEvent) => {
    if (isDragging && videoRef.current) {
      const seekBar = document.querySelector<HTMLElement>('.seek-bar');
      if (seekBar) {
        const seekPosition = calculateSeekPosition(e.clientX, seekBar);
        const newProgress = seekPosition * 100;
        const newTime = seekPosition * videoRef.current.duration;

        // Update both progress and video time synchronously
        setProgress(newProgress);
        videoRef.current.currentTime = newTime;
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
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
        threshold: 0.5
      }
    );

    observer.observe(containerElement);

    return () => {
      observer.unobserve(containerElement);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.pause();
    };
  }, [handleTimeUpdate]);

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
        <ActionButton onClick={(e) => {
          e.stopPropagation();
          currentUser ? signOut() : signInWithGoogle();
        }}>
          {currentUser ? (
            currentUser.photoURL ? (
              <ProfileImage 
                src={currentUser.photoURL} 
                alt="Profile"
              />
            ) : (
              <MdAccountCircle className="icon" />
            )
          ) : (
            <MdPerson className="icon" />
          )}
          <span className="count">{currentUser ? currentUser.displayName || 'User' : 'Sign In'}</span>
        </ActionButton>
        <ActionButton onClick={(e) => e.stopPropagation()}>
          <MdFavorite className="icon" />
          <span className="count">{likes}</span>
        </ActionButton>
        <ActionButton 
          data-testid="comment-button"
          onClick={(e) => {
            e.stopPropagation();
            setIsCommentSectionOpen(true);
          }}
        >
          <MdChat className="icon" />
          <span className="count">{commentCount}</span>
        </ActionButton>
        <ActionButton onClick={(e) => e.stopPropagation()}>
          <MdShare className="icon" />
          <span className="count">{shares}</span>
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
      <CommentSection 
        isOpen={isCommentSectionOpen}
        onClose={() => setIsCommentSectionOpen(false)}
        videoId={id}
      />
    </VideoContainer>
  );
};

export default VideoPlayer;
