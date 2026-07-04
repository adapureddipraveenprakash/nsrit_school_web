import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export const subscribeAcademicYears = (branchId, onUpdate, onError) => {
  if (!branchId) return () => {};
  const docRef = doc(db, 'academic_years', branchId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data().list || []);
    } else {
      onUpdate([]);
    }
  }, onError);
};

export const saveAcademicYears = async (branchId, list) => {
  const docRef = doc(db, 'academic_years', branchId);
  return setDoc(docRef, {
    branchId,
    list,
    updatedAt: new Date().toISOString()
  });
};

const yearService = {
  subscribeAcademicYears,
  saveAcademicYears
};

export default yearService;
