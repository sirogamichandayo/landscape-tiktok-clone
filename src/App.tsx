import React, { useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import Navigation from './components/Navigation';
import VideoFeed from './components/VideoFeed';
import { AuthProvider } from './contexts/AuthContext';
import { VideoProvider } from './contexts/VideoContext';
import { addTestData } from './utils/testData';
import { initializeEmulators } from './config/firebase';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: black;
    color: white;
    overflow: hidden;
  }

  ::-webkit-scrollbar {
    width: 0px;
  }

  button {
    font-family: inherit;
  }
`;

const App: React.FC = () => {
  useEffect(() => {
    // Initialize Firebase emulators and test data in development
    const initializeApp = async () => {
      if (import.meta.env.DEV) {
        try {
          // First initialize emulators
          const emulatorsReady = await initializeEmulators();

          if (emulatorsReady) {
            // Then add test data
            await addTestData();
            console.log('Development environment initialized with test data');
          }
        } catch (error) {
          console.error('Failed to initialize development environment:', error);
        }
      }
    };

    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <VideoProvider>
        <GlobalStyle />
        <Navigation />
        <VideoFeed />
      </VideoProvider>
    </AuthProvider>
  );
};

export default App;
