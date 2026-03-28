import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";

export interface UserStats {
  points: number;
  streak: number;
  lastActiveDate: string;
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const statsRef = doc(db, "userStats", currentUser.uid);
    const unsubscribe = onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        setStats(doc.data() as UserStats);
      } else {
        // Initialize stats if they don't exist
        const initialStats: UserStats & { uid: string } = { 
          uid: currentUser.uid,
          points: 0, 
          streak: 0, 
          lastActiveDate: new Date().toISOString().split('T')[0] 
        };
        setDoc(statsRef, initialStats);
        setStats(initialStats as UserStats);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPoints = async (points: number) => {
    if (!auth.currentUser || !stats) return;
    const statsRef = doc(db, "userStats", auth.currentUser.uid);
    await updateDoc(statsRef, { points: stats.points + points });
  };

  return { stats, loading, addPoints };
}
