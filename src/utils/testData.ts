import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Function to clear all test data
export const clearTestData = async () => {
  try {
    const videosRef = collection(db, 'videos');
    const querySnapshot = await getDocs(videosRef);

    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log('All test data cleared successfully');
  } catch (error) {
    console.error('Error clearing test data:', error);
    throw error;
  }
};

export const testVideos = [
  {
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Big Buck Bunny - A classic open source animated film #animation #classic',
    username: 'animationlover',
    userId: 'test-user-1',
    likes: 1543,
    comments: 89,
    shares: 234,
    timestamp: new Date()
  },
  {
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    description: 'Elephants Dream - Another beautiful open source animation #creative #art',
    username: 'digitalartist',
    userId: 'test-user-2',
    likes: 2651,
    comments: 156,
    shares: 432,
    timestamp: new Date()
  },
  {
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'For Bigger Blazes - Amazing visual effects #vfx #creative',
    username: 'vfxmaster',
    userId: 'test-user-3',
    likes: 1892,
    comments: 112,
    shares: 345,
    timestamp: new Date()
  }
];

export const addTestData = async () => {
  try {
    const videosRef = collection(db, 'videos');

    // Check existing videos
    const querySnapshot = await getDocs(videosRef);
    if (!querySnapshot.empty) {
      console.log('Test data already exists, skipping initialization');
      return;
    }

    // Add test videos if collection is empty
    const addPromises = testVideos.map(video => addDoc(videosRef, video));
    await Promise.all(addPromises);

    console.log('Test data added successfully');
  } catch (error) {
    console.error('Error adding test data:', error);
    throw error; // Propagate error for better error handling
  }
};
