import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export const subscribeHolidays = (branchId, onUpdate, onError) => {
  if (!branchId) return () => {};
  const docRef = doc(db, 'holidays', branchId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data().list || []);
    } else {
      onUpdate([]);
    }
  }, onError);
};

export const saveHolidays = async (branchId, list) => {
  const docRef = doc(db, 'holidays', branchId);
  return setDoc(docRef, {
    branchId,
    list,
    updatedAt: new Date().toISOString()
  });
};

const holidayService = {
  subscribeHolidays,
  saveHolidays
};

export default holidayService;
