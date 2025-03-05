import { addTestData, clearTestData } from '../utils/testData';
import { initializeEmulators } from '../config/firebase';

const seedTestData = async () => {
  // Initialize emulators first
  console.log('Initializing Firebase emulators...');
  const emulatorsInitialized = await initializeEmulators();
  if (!emulatorsInitialized) {
    console.error('Failed to initialize emulators');
    process.exit(1);
  }
  console.log('Firebase emulators initialized successfully');
  try {
    console.log('Clearing existing test data...');
    await clearTestData();

    console.log('Adding new test data...');
    const result = await addTestData();

    console.log('Test data seeding completed successfully');
    console.log('Users created:', result.users.length);
    console.log('Videos added:', result.videos.length);
    console.log('Sample video details:');
    result.videos.forEach((video, index) => {
      console.log(`Video ${index + 1}:`);
      console.log('  id:', video.id);
      console.log('  videoId:', video.videoId);
      console.log('  url:', video.url);
      console.log('  username:', video.username);
    });

  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
};

// Execute the seeding
seedTestData();
