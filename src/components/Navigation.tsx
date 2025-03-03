import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  color: white;

  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const NavActions = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: background-color 0.2s;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 14px;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const AuthButton = styled(NavButton)<{ primary?: boolean }>`
  background-color: ${props => props.primary ? '#FE2C55' : 'transparent'};
  border: ${props => props.primary ? 'none' : '1px solid white'};
  min-width: 80px;

  @media (max-width: 480px) {
    min-width: 70px;
  }

  &:hover {
    background-color: ${props => props.primary ? '#FF4D6A' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    gap: 8px;
  }

  span {
    @media (max-width: 480px) {
      display: none;
    }
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

const Navigation: React.FC = () => {
  const { currentUser, signInWithGoogle, signOut } = useAuth();

  return (
    <Nav>
      <Logo>TikTok Landscape</Logo>
      <NavActions>
        <NavButton>Home</NavButton>
        {currentUser ? (
          <>
            <UserInfo>
              <Avatar src={currentUser.photoURL || ''} alt={currentUser.displayName || ''} />
              <span>{currentUser.displayName}</span>
            </UserInfo>
            <AuthButton onClick={signOut}>Sign Out</AuthButton>
          </>
        ) : (
          <AuthButton primary onClick={signInWithGoogle}>Sign In</AuthButton>
        )}
      </NavActions>
    </Nav>
  );
};

export default Navigation;
