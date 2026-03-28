import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";

export interface SyllabusProgress {
  id: string;
  uid: string;
  subject: string;
  topic: string;
  completed: boolean;
}

export function useSyllabusProgress() {
  const [progress, setProgress] = useState<SyllabusProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const q = query(collection(db, "syllabusProgress"), where("uid", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const progressData: SyllabusProgress[] = [];
      snapshot.forEach((doc) => {
        progressData.push({ id: doc.id, ...doc.data() } as SyllabusProgress);
      });
      setProgress(progressData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleTopic = async (subject: string, topic: string, completed: boolean) => {
    if (!auth.currentUser) return;
    const progressId = `${auth.currentUser.uid}_${subject}_${topic}`;
    const progressRef = doc(db, "syllabusProgress", progressId);
    await setDoc(progressRef, {
      uid: auth.currentUser.uid,
      subject,
      topic,
      completed
    });
  };

  return { progress, loading, toggleTopic };
}
