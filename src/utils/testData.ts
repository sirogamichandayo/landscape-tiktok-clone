import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';

// Test user data
export const testUsers = [
  {
    email: "taro.tanaka@example.com",
    password: "password123",
    displayName: "田中太郎",
    photoURL: "https://example.com/photos/tanaka.jpg"
  },
  {
    email: "hanako.yamada@example.com",
    password: "password123",
    displayName: "山田花子",
    photoURL: "https://example.com/photos/yamada.jpg"
  },
  {
    email: "john.smith@example.com",
    password: "password123",
    displayName: "John Smith",
    photoURL: "https://example.com/photos/smith.jpg"
  }
];

// Function to create test users
export const createTestUsers = async () => {
  try {
    const createdUsers = [];
    for (const userData of testUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        createdUsers.push(userCredential.user);
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/email-already-in-use') {
          console.log(`User ${userData.email} already exists`);
        } else {
          throw error;
        }
      }
    }
    console.log('Test users created successfully');
    return createdUsers;
  } catch (error) {
    console.error('Error creating test users:', error);
    throw error;
  }
};

// Function to clear all test data
export const clearTestData = async () => {
  try {
    // Clear videos
    const videosRef = collection(db, 'videos');
    const videosSnapshot = await getDocs(videosRef);
    const videoDeletePromises = videosSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(videoDeletePromises);

    // Clear comments
    const commentsRef = collection(db, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);
    const commentDeletePromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(commentDeletePromises);

    console.log('All test data cleared successfully');
  } catch (error) {
    console.error('Error clearing test data:', error);
    throw error;
  }
};

// Sample videos using public test videos
export const sampleVideos = [
  {
    id: 'video1',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: '富士山の絶景！🗻 #富士山 #絶景 #日本の風景',
    userId: 'user1',
    username: '田中太郎'
  },
  {
    id: 'video2',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    description: '簡単！お家で作る本格パスタ🍝 #料理 #パスタ #クッキング',
    userId: 'user2',
    username: '山田花子'
  },
  {
    id: 'video3',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Latest Tech Review: The Future of AR 🔮 #tech #AR #review',
    userId: 'user3',
    username: 'John Smith'
  }
];

// Function to prepare test video metadata using public sample videos
export const prepareTestVideos = async () => {
  try {
    const testVideos = sampleVideos.map(video => ({
      videoId: video.id,
      url: video.url,
      description: video.description,
      username: video.username,
      userId: video.userId,
      likes: Math.floor(Math.random() * 1900) + 100, // 100-2000
      comments: Math.floor(Math.random() * 90) + 10, // 10-100
      shares: Math.floor(Math.random() * 45) + 5, // 5-50
      timestamp: new Date()
    }));

    console.log('Test video metadata prepared with public URLs');
    return testVideos;
  } catch (error) {
    console.error('Error preparing test video metadata:', error);
    throw error;
  }
};

export const addTestData = async () => {
  try {
    // Step 1: Create test users
    console.log('Creating test users...');
    const users = await createTestUsers();

    // Step 2: Prepare test video metadata
    console.log('Preparing test video metadata...');
    const testVideos = await prepareTestVideos();

    // Step 3: Add video metadata to Firestore
    console.log('Adding video metadata to Firestore...');
    const videosRef = collection(db, 'videos');

    // Add videos one by one to get their document IDs
    const addedVideos = [];
    for (const video of testVideos) {
      const docRef = await addDoc(videosRef, video);
      // Create video object with document ID as both id and videoId
      const videoWithId = { 
        ...video, 
        id: docRef.id,
        videoId: docRef.id 
      };
      // Update the Firestore document with its ID
      await updateDoc(doc(db, 'videos', docRef.id), { 
        id: docRef.id,
        videoId: docRef.id 
      });
      addedVideos.push(videoWithId);
    }

    console.log('All test data added successfully');
    return {
      users,
      videos: addedVideos
    };
  } catch (error) {
    console.error('Error adding test data:', error);
    throw error;
  }
};
