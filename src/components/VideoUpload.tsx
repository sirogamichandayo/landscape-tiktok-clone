import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { uploadVideo } from '../services/videoService';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContext';
import LoadingSpinner from './LoadingSpinner';

const UploadContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;

  @media (max-width: 768px) {
    bottom: 80px;
    right: 16px;
  }
`;

const UploadButton = styled.button`
  background-color: #FE2C55;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const UploadModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #1f1f1f;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  display: ${props => props.isOpen ? 'block' : 'none'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  @media (max-width: 480px) {
    width: 95%;
    padding: 16px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;

  h2 {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 8px;

    @media (max-width: 480px) {
      font-size: 1.2rem;
    }
  }
`;

const Input = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #2f2f2f;
  color: white;
  font-size: 14px;

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 13px;
  }
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #2f2f2f;
  color: white;
  min-height: 100px;
  resize: vertical;
  font-size: 14px;

  @media (max-width: 480px) {
    min-height: 80px;
    padding: 6px 10px;
    font-size: 13px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const SubmitButton = styled.button`
  flex: 1;
  background-color: #FE2C55;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;

  @media (max-width: 480px) {
    padding: 10px;
    font-size: 13px;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #FE2C55;
  margin-top: 8px;
  font-size: 14px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
`;

const VideoUpload: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const { refreshVideos } = useVideo();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !fileInputRef.current?.files?.[0]) return;

    try {
      setUploading(true);
      setError(null);
      const file = fileInputRef.current.files[0];
      await uploadVideo(
        file,
        description,
        currentUser.uid,
        currentUser.displayName || 'Anonymous'
      );
      setIsModalOpen(false);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      refreshVideos();
    } catch (error) {
      setError('Failed to upload video. Please try again.');
      console.error('Error uploading video:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <UploadContainer>
        <UploadButton onClick={() => setIsModalOpen(true)}>+</UploadButton>
      </UploadContainer>

      <UploadModal isOpen={isModalOpen}>
        <Form onSubmit={handleUpload}>
          <h2>Upload Video</h2>
          <Input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            required
          />
          <TextArea
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <ButtonContainer>
            <SubmitButton type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </SubmitButton>
            <SubmitButton type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </SubmitButton>
          </ButtonContainer>
        </Form>
        {uploading && (
          <LoadingOverlay>
            <LoadingSpinner size="medium" />
          </LoadingOverlay>
        )}
      </UploadModal>
    </>
  );
};

export default VideoUpload;
