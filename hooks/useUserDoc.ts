import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { UserDocument } from '../types';

export function useUserDoc(uid: string | null) {
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setUserDoc(null);
      setLoading(false);
      return;
    }
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        setUserDoc(snap.data() as UserDocument);
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
  }, [uid]);

  return { userDoc, loading };
}
