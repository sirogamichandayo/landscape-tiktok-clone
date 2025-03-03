import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import VideoPlayer from '../VideoPlayer';

const mockProps = {
  url: 'test-video-url.mp4',
  description: 'Test video description',
  username: 'testuser',
  likes: 100,
  comments: 50,
  shares: 25,
};

describe('VideoPlayer', () => {
  beforeEach(() => {
    // Mock video element methods
    window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = jest.fn();
    window.HTMLMediaElement.prototype.load = jest.fn();
  });

  it('renders video player with controls', () => {
    render(<VideoPlayer {...mockProps} />);
    const video = screen.getByRole('video');
    expect(video).toBeInTheDocument();
  });

  it('prevents video play/pause when interacting with seek bar', () => {
    const { container } = render(<VideoPlayer {...mockProps} />);
    const seekBar = container.querySelector('.seek-bar');
    const video = screen.getByRole('video');

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
    const { container } = render(<VideoPlayer {...mockProps} />);
    const seekBar = container.querySelector('.seek-bar');
    const video = screen.getByRole('video');

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
