import React from 'react';
import { render, fireEvent, screen, waitFor, cleanup } from '@testing-library/react';
import VideoPlayer from '../VideoPlayer';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { subscribeToComments, createComment } from '../../services/commentService';

// Mock the modules
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    currentUser: null,
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockUnsubscribe = jest.fn();

// Create mock functions
const mockUnsubscribe = jest.fn();
const mockSubscribeToComments = jest.fn((_, callback) => {
  callback([]);
  return mockUnsubscribe;
});
const mockCreateComment = jest.fn();
const mockFormatTimestamp = jest.fn(() => '2h ago');

jest.mock('../../services/commentService', () => ({
  subscribeToComments: mockSubscribeToComments,
  createComment: mockCreateComment,
  formatTimestamp: mockFormatTimestamp,
}));

const mockProps = {
  id: 'test-video-id',
  url: 'test-video-url.mp4',
  description: 'Test video description',
  username: 'testuser',
  likes: 100,
  comments: 50,
  shares: 25,
};

describe('VideoPlayer', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock video element methods
    window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = jest.fn();
    window.HTMLMediaElement.prototype.load = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockImplementation(() => ({
      currentUser: null,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    }));

    // Mock console.error
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    console.error = originalConsoleError;
    mockUnsubscribe.mockClear();
  });

  describe('Video Playback', () => {
    it('renders video player with controls', () => {
      render(
        <AuthProvider>
          <VideoPlayer {...mockProps} />
        </AuthProvider>
      );
      const video = screen.getByRole('video') as HTMLVideoElement;
      expect(video).toBeInTheDocument();
    });

    it('prevents video play/pause when interacting with seek bar', () => {
      const { container } = render(
        <AuthProvider>
          <VideoPlayer {...mockProps} />
        </AuthProvider>
      );
      const seekBar = container.querySelector('.seek-bar');
      const video = screen.getByRole('video') as HTMLVideoElement;

      // Mock video methods
      Object.defineProperty(video, 'duration', { value: 100 });
      Object.defineProperty(video, 'currentTime', { value: 0, writable: true });

      // Click on seek bar
      fireEvent.click(seekBar!);

      // Video should not toggle play state when seek bar is clicked
      expect(video.play).not.toHaveBeenCalled();
      expect(video.pause).not.toHaveBeenCalled();
    });

    it('updates video time when seek bar is clicked', () => {
      const { container } = render(
        <AuthProvider>
          <VideoPlayer {...mockProps} />
        </AuthProvider>
      );
      const seekBar = container.querySelector('.seek-bar');
      const video = screen.getByRole('video') as HTMLVideoElement;

      // Mock video properties and methods
      Object.defineProperty(video, 'duration', { value: 100 });
      Object.defineProperty(video, 'currentTime', { value: 0, writable: true });

      // Simulate click at 50% of seek bar width
      fireEvent.click(seekBar!, {
        clientX: seekBar!.getBoundingClientRect().left + (seekBar!.getBoundingClientRect().width / 2)
      });

      // Video time should be updated to 50% of duration
      expect(video.currentTime).toBe(50);
    });
  });

  describe('Comment Section', () => {
    describe('Comment Display', () => {
      it('toggles comment section visibility', () => {
        render(
          <AuthProvider>
            <VideoPlayer {...mockProps} />
          </AuthProvider>
        );

        // Initially not visible
        expect(screen.queryByTestId('comment-section')).not.toBeVisible();

        // Open comment section
        const commentButton = screen.getByTestId('comment-button');
        fireEvent.click(commentButton);
        expect(screen.getByTestId('comment-section')).toBeVisible();

        // Close comment section
        const closeButton = screen.getByTestId('comment-close-button');
        fireEvent.click(closeButton);
        expect(screen.queryByTestId('comment-section')).not.toBeVisible();
      });

      it('updates comment count when new comments are received', async () => {
        const mockComments = [
          { id: '1', text: 'Test comment 1' },
          { id: '2', text: 'Test comment 2' }
        ];

        const localMockUnsubscribe = jest.fn();
        (subscribeToComments as jest.Mock).mockImplementationOnce((_, callback) => {
          callback(mockComments);
          return localMockUnsubscribe;
        });

        render(
          <AuthProvider>
            <VideoPlayer {...mockProps} />
          </AuthProvider>
        );

        await waitFor(() => {
          expect(screen.getByText('2')).toBeInTheDocument();
        });

        // Component should unsubscribe on unmount
        cleanup();
        expect(localMockUnsubscribe).toHaveBeenCalled();
      });

      it('shows empty state when no comments are available', async () => {
        const localMockUnsubscribe = jest.fn();
        (subscribeToComments as jest.Mock).mockImplementationOnce((_, callback) => {
          callback([]);
          return localMockUnsubscribe;
        });

        render(
          <AuthProvider>
            <VideoPlayer {...mockProps} />
          </AuthProvider>
        );

        const commentButton = screen.getByTestId('comment-button');
        fireEvent.click(commentButton);

        await waitFor(() => {
          expect(screen.getByText('0')).toBeInTheDocument();
        });

        // Component should unsubscribe on unmount
        cleanup();
        expect(localMockUnsubscribe).toHaveBeenCalled();
      });

      it('unsubscribes from comments when unmounted', () => {
        const localMockUnsubscribe = jest.fn();
        (subscribeToComments as jest.Mock).mockImplementationOnce(() => localMockUnsubscribe);

        const { unmount } = render(
          <AuthProvider>
            <VideoPlayer {...mockProps} />
          </AuthProvider>
        );

        unmount();
        expect(localMockUnsubscribe).toHaveBeenCalled();
      });
    });

    describe('Comment Creation', () => {
      beforeEach(() => {
        // Mock logged-in user
        (useAuth as jest.Mock).mockReturnValue({
          currentUser: {
            uid: 'test-user-id',
            displayName: 'Test User',
            photoURL: 'test-avatar.jpg'
          },
          signInWithGoogle: jest.fn(),
          signOut: jest.fn()
        });
      });

      it('allows creating new comments when user is logged in', async () => {
        const localMockUnsubscribe = jest.fn();
        (subscribeToComments as jest.Mock).mockImplementationOnce(() => localMockUnsubscribe);

        const { unmount } = render(
          <AuthProvider>
            <VideoPlayer {...mockProps} />
          </AuthProvider>
        );

        // Open comment section
        const commentButton = screen.getByTestId('comment-button');
        fireEvent.click(commentButton);

        // Type and submit comment
        const input = screen.getByPlaceholderText('Add a comment...');
        fireEvent.change(input, { target: { value: 'Test comment' } });

        const form = input.closest('form');
        fireEvent.submit(form!);

        await waitFor(() => {
          expect(createComment).toHaveBeenCalledWith({
            videoId: mockProps.id,
            userId: 'test-user-id',
            username: 'Test User',
            userAvatar: 'test-avatar.jpg',
            text: 'Test comment'
          });
        });

        unmount();
        expect(localMockUnsubscribe).toHaveBeenCalled();
      });

      it('disables comment input when user is not logged in', () => {
        const localMockUnsubscribe = jest.fn();
        (subscribeToComments as jest.Mock).mockImplementationOnce(() => localMockUnsubscribe);

        // Mock logged-out user
        (useAuth as jest.Mock).mockReturnValue({
          currentUser: null,
          signInWithGoogle: jest.fn(),
          signOut: jest.fn()
        });

        const { unmount } = render(
          <AuthProvider>
            <VideoPlayer {...mockProps} />
          </AuthProvider>
        );

        const commentButton = screen.getByTestId('comment-button');
        fireEvent.click(commentButton);

        const input = screen.getByPlaceholderText('Add a comment...');
        expect(input).toBeDisabled();

        unmount();
        expect(localMockUnsubscribe).toHaveBeenCalled();
      });

      it('handles comment creation errors', async () => {
        const error = new Error('Failed to create comment');
        const localMockUnsubscribe = jest.fn();

        (subscribeToComments as jest.Mock).mockImplementationOnce(() => localMockUnsubscribe);
        (createComment as jest.Mock).mockRejectedValueOnce(error);

        const { unmount } = render(
          <AuthProvider>
            <VideoPlayer {...mockProps} />
          </AuthProvider>
        );

        // Open comment section
        const commentButton = screen.getByTestId('comment-button');
        fireEvent.click(commentButton);

        // Type and submit comment
        const input = screen.getByPlaceholderText('Add a comment...');
        fireEvent.change(input, { target: { value: 'Test comment' } });

        const form = input.closest('form');
        fireEvent.submit(form!);

        // Verify error handling
        await waitFor(() => {
          expect(console.error).toHaveBeenCalledWith('Failed to create comment:', error);
        });

        unmount();
        expect(localMockUnsubscribe).toHaveBeenCalled();
      });
    });
  });

});
