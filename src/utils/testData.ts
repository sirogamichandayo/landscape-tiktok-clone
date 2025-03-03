import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
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
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
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

// Sample videos using public test videos
export const sampleVideos = [
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: '富士山の絶景！🗻 #富士山 #絶景 #日本の風景',
    userId: 'user1',
    username: '田中太郎'
  },
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    description: '簡単！お家で作る本格パスタ🍝 #料理 #パスタ #クッキング',
    userId: 'user2',
    username: '山田花子'
  },
  {
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Latest Tech Review: The Future of AR 🔮 #tech #AR #review',
    userId: 'user3',
    username: 'John Smith'
  }
];

// Function to prepare test video data
export const uploadTestVideos = async () => {
  try {
    const testVideos = sampleVideos.map(video => ({
      url: video.url,
      description: video.description,
      username: video.username,
      userId: video.userId,
      likes: Math.floor(Math.random() * 1900) + 100, // 100-2000
      comments: Math.floor(Math.random() * 90) + 10, // 10-100
      shares: Math.floor(Math.random() * 45) + 5, // 5-50
      timestamp: new Date()
    }));

    console.log('Test videos prepared with public URLs');
    return testVideos;
  } catch (error) {
    console.error('Error preparing test videos:', error);
    throw error;
  }
};

export const addTestData = async () => {
  try {
    // Step 1: Create test users
    console.log('Creating test users...');
    const users = await createTestUsers();

    // Step 2: Upload test videos
    console.log('Uploading test videos...');
    const uploadedVideos = await uploadTestVideos();

    // Step 3: Add video metadata to Firestore
    console.log('Adding video metadata to Firestore...');
    const videosRef = collection(db, 'videos');
    const addPromises = uploadedVideos.map(video => addDoc(videosRef, video));
    await Promise.all(addPromises);

    console.log('All test data added successfully');
    return {
      users,
      videos: uploadedVideos
    };
  } catch (error) {
    console.error('Error adding test data:', error);
    throw error;
  }
};
