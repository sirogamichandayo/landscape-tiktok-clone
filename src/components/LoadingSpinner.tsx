import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #FE2C55;
  animation: ${spin} 1s ease-in-out infinite;
`;

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const StyledSpinner = styled(Spinner)`
    width: ${sizes[size]};
    height: ${sizes[size]};
  `;

  return (
    <SpinnerContainer>
      <StyledSpinner />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;