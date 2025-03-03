import { 
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface Video {
  id: string;
  url: string;
  description: string;
  username: string;
  userId: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
}

export const fetchVideos = async (limitCount: number = 10): Promise<Video[]> => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    })) as Video[];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

export const uploadVideo = async (
  file: File,
  description: string,
  userId: string,
  username: string
): Promise<Video | null> => {
  try {
    // Upload video file to Firebase Storage
    const videoRef = ref(storage, `videos/${userId}/${Date.now()}-${file.name}`);
    await uploadBytes(videoRef, file);
    const url = await getDownloadURL(videoRef);

    // Add video metadata to Firestore
    const videoData = {
      url,
      description,
      username,
      userId,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'videos'), videoData);
    
    return {
      id: docRef.id,
      ...videoData,
      timestamp: new Date(),
    } as Video;
  } catch (error) {
    console.error('Error uploading video:', error);
    return null;
  }
};

export const updateVideoStats = async (
  videoId: string,
  stats: Partial<Pick<Video, 'likes' | 'comments' | 'shares'>>
): Promise<void> => {
  try {
    const videoRef = collection(db, 'videos', videoId);
    await addDoc(videoRef, {
      ...stats,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating video stats:', error);
  }
};