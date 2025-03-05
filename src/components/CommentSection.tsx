import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdClose, MdSend, MdAccountCircle } from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import { 
  Comment, 
  subscribeToComments, 
  createComment, 
  formatTimestamp 
} from '../services/commentService';

interface CommentSectionProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

const stopPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
  e.stopPropagation();
};

const CommentOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  background-color: rgba(0, 0, 0, 0.95);
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  padding: 20px;
  color: white;

  * {
    &:not(svg) {
      pointer-events: auto;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;

  &:hover {
    opacity: 0.8;
  }
`;

const CommentList = styled.div`
  margin-top: 60px;
  overflow-y: auto;
  height: calc(100% - 60px);
`;

const CommentItem = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
`;

const AvatarContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  .icon {
    width: 100%;
    height: 100%;
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const CommentText = styled.div`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
`;

const Timestamp = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin-top: 4px;
`;

const ErrorMessage = styled.div`
  color: #ff4d4d;
  background-color: rgba(255, 77, 77, 0.1);
  padding: 8px 16px;
  border-radius: 4px;
  margin: 8px 0;
  font-size: 14px;
`;

const CommentInput = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const CommentSection: React.FC<CommentSectionProps> = ({ isOpen, onClose, videoId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!isOpen || !videoId) return;

    const unsubscribe = subscribeToComments(videoId, (newComments) => {
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [isOpen, videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    console.log('[DEBUG_LOG] Attempting to create comment with videoId:', videoId);

    if (!videoId) {
      const errorMsg = 'Cannot create comment: Video ID is missing';
      console.error('[DEBUG_LOG]', errorMsg);
      setError(errorMsg);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const commentData = {
        videoId,
        userId: currentUser.uid,
        username: currentUser.displayName || 'Anonymous',
        userAvatar: currentUser.photoURL || undefined,
        text: newComment.trim(),
      };
      console.log('[DEBUG_LOG] Creating comment with data:', commentData);

      await createComment(commentData);
      console.log('[DEBUG_LOG] Comment created successfully');
      setNewComment('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';
      console.error('[DEBUG_LOG] Failed to create comment:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CommentOverlay 
      data-testid="comment-section" 
      isOpen={isOpen}
      onClick={stopPropagation}
    >
      <CloseButton 
        data-testid="comment-close-button" 
        onClick={(e) => {
          stopPropagation(e);
          onClose();
        }}
      >
        <MdClose />
      </CloseButton>
      <CommentList onClick={stopPropagation}>
        {comments.map((comment) => (
          <CommentItem key={comment.id}>
            <AvatarContainer>
              {comment.userAvatar ? (
                <AvatarImage
                  src={comment.userAvatar}
                  alt={comment.username}
                />
              ) : (
                <MdAccountCircle className="icon" data-testid="default-avatar" />
              )}
            </AvatarContainer>
            <CommentContent>
              <Username>{comment.username}</Username>
              <CommentText>{comment.text}</CommentText>
              <Timestamp>{formatTimestamp(comment.timestamp)}</Timestamp>
            </CommentContent>
          </CommentItem>
        ))}
      </CommentList>
      <CommentInput onClick={stopPropagation}>
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
        <form 
          role="form" 
          onSubmit={(e) => {
            e.preventDefault();
            stopPropagation(e);
            handleSubmit(e);
          }} 
          onClick={stopPropagation}
          style={{ display: 'flex', width: '100%', gap: '8px' }}
        >
          <Input
            type="text"
            value={newComment}
            onChange={(e) => {
              stopPropagation(e);
              setNewComment(e.target.value);
            }}
            onClick={stopPropagation}
            onKeyDown={stopPropagation}
            onKeyUp={stopPropagation}
            placeholder="Add a comment..."
            disabled={!currentUser || isLoading}
          />
          <SendButton 
            type="submit" 
            disabled={!currentUser || !newComment.trim() || isLoading}
            onClick={stopPropagation}
          >
            <MdSend />
          </SendButton>
        </form>
      </CommentInput>
    </CommentOverlay>
  );
};

export default CommentSection;
