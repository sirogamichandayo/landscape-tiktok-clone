import { 
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Video {
  id: string;
  videoId: string;
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

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        videoId: data.videoId || doc.id, // Use existing videoId or fallback to doc.id
        ...data,
        timestamp: data.timestamp?.toDate(),
      };
    }) as Video[];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
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
