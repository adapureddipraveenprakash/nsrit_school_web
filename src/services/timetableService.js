import { db } from './firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export const subscribeTimetable = (sectionId, onUpdate, onError) => {
  if (!sectionId) return () => {};
  
  const docRef = doc(db, 'timetable', sectionId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data());
    } else {
      onUpdate(null);
    }
  }, onError);
};

export const saveTimetable = async (sectionId, { branchId, classId, className, sectionName, periods }) => {
  const docRef = doc(db, 'timetable', sectionId);
  return setDoc(docRef, {
    branchId,
    classId,
    className,
    sectionId,
    sectionName,
    periods,
    updatedAt: serverTimestamp(),
  });
};

const timetableService = {
  subscribeTimetable,
  saveTimetable
};

export default timetableService;
