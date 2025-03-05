import { 
  collection,
  query,
  where,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QuerySnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  timestamp?: Date;
  likes: number;
}

export interface CreateCommentData {
  videoId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
}

const COMMENTS_COLLECTION = 'comments';

export const subscribeToComments = (
  videoId: string,
  callback: (comments: Comment[]) => void
) => {
  console.log('[DEBUG_LOG] Subscribing to comments for videoId:', videoId);
  const commentsRef = collection(db, COMMENTS_COLLECTION);
  const commentsQuery = query(
    commentsRef,
    where('videoId', '==', videoId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(commentsQuery, (snapshot: QuerySnapshot<DocumentData>) => {
    const comments = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('[DEBUG_LOG] Raw comment data:', data);

      let timestamp: Date | undefined = undefined;
      try {
        timestamp = data.timestamp?.toDate();
        console.log('[DEBUG_LOG] Converted timestamp:', timestamp);
      } catch (error) {
        console.error('[DEBUG_LOG] Error converting timestamp:', error);
      }

      return {
        id: doc.id,
        ...data,
        timestamp,
      } as Comment;
    });

    console.log('[DEBUG_LOG] Processed comments:', comments.length, 'comments');
    callback(comments);
  });
};

export const createComment = async (data: CreateCommentData): Promise<string> => {
  console.log('[DEBUG_LOG] Attempting to create comment with data:', data);
  if (!data.videoId) {
    console.error('[DEBUG_LOG] Missing videoId in comment data');
    throw new Error('videoId is required to create a comment');
  }

  const commentsRef = collection(db, COMMENTS_COLLECTION);
  try {
    const docRef = await addDoc(commentsRef, {
      ...data,
      timestamp: serverTimestamp(),
      likes: 0,
    });
    console.log('[DEBUG_LOG] Comment created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[DEBUG_LOG] Error creating comment:', error);
    throw new Error('Failed to create comment. Please try again.');
  }
};

export const formatTimestamp = (timestamp: Date | undefined): string => {
  if (!timestamp) {
    return 'Just now';
  }

  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};
