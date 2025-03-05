import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentSection from '../CommentSection';

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
  }),
}));

// Mock the commentService
jest.mock('../../services/commentService', () => {
  const mockComments = new Map();
  mockComments.set('test-video-id', [
    {
      id: '1',
      username: 'testUser1',
      userAvatar: 'https://example.com/avatar1.jpg',
      text: 'Test comment 1',
      timestamp: new Date().getTime(),
    },
    {
      id: '2',
      username: 'testUser2',
      userAvatar: null,
      text: 'Test comment 2',
      timestamp: new Date().getTime(),
    },
  ]);

  return {
    subscribeToComments: (videoId: string, callback: (comments: any[]) => void) => {
      const comments = mockComments.get(videoId) || [];
      callback(comments);
      return jest.fn();
    },
    createComment: jest.fn(),
    formatTimestamp: () => '1 minute ago',
  };
});

describe('CommentSection', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    videoId: 'test-video-id',
  };

  it('renders comments with avatar when available', () => {
    render(<CommentSection {...defaultProps} />);

    // Check if the avatar image is rendered for the first comment
    const avatarImage = screen.getByAltText('testUser1');
    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage.tagName).toBe('IMG');
    expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar1.jpg');
  });

  it('renders default icon when avatar is not available', () => {
    render(<CommentSection {...defaultProps} />);

    // Check if MdAccountCircle is rendered for the second comment
    const defaultAvatarIcon = screen.getByTestId('default-avatar');
    expect(defaultAvatarIcon).toBeInTheDocument();
    expect(defaultAvatarIcon.tagName).toBe('svg');
  });
});
