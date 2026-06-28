import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

export const subscribeNotices = ({ branchId, category, onUpdate, onError }) => {
  if (!branchId) return () => {};
  
  const q = query(
    collection(db, 'notices'),
    where('branchId', '==', branchId)
  );
  
  return onSnapshot(q, (snapshot) => {
    let list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Sort in memory by createdAt desc to avoid requiring a composite index
    list.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
      return timeB - timeA;
    });

    if (category && category !== 'All') {
      list = list.filter(item => item.category === category);
    }
    // Sort pinned notices first
    list.sort((a, b) => {
      const pinA = a.pinned ? 1 : 0;
      const pinB = b.pinned ? 1 : 0;
      return pinB - pinA;
    });
    onUpdate(list);
  }, onError);
};

export const createNotice = async ({ title, body, category, branchId, author, authorId, pinned = false }) => {
  const today = new Date().toISOString().slice(0, 10);
  return addDoc(collection(db, 'notices'), {
    title,
    body,
    category,
    branchId,
    author,
    authorId,
    pinned,
    date: today,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateNotice = async (noticeId, updates) => {
  const noticeRef = doc(db, 'notices', noticeId);
  return updateDoc(noticeRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteNotice = async (noticeId) => {
  return deleteDoc(doc(db, 'notices', noticeId));
};

const noticesService = {
  subscribeNotices,
  createNotice,
  updateNotice,
  deleteNotice
};

export default noticesService;
