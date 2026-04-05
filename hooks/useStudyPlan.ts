import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where } from "firebase/firestore";
import { db, auth } from "@/firebase";

export interface StudyTask {
  id: string;
  task: string;
  time: string;
  subject: string;
  completed: boolean;
  createdAt: any;
}

export function useStudyPlan() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const tasksRef = collection(db, "users", currentUser.uid, "studyPlan");
    const q = query(tasksRef, orderBy("time", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudyTask[];
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      console.error("Study plan fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTask = async (task: string, time: string, subject: string) => {
    if (!auth.currentUser) return;
    const tasksRef = collection(db, "users", auth.currentUser.uid, "studyPlan");
    await addDoc(tasksRef, {
      task,
      time,
      subject,
      completed: false,
      createdAt: serverTimestamp()
    });
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    if (!auth.currentUser) return;
    const taskRef = doc(db, "users", auth.currentUser.uid, "studyPlan", taskId);
    await updateDoc(taskRef, { completed: !completed });
  };

  const deleteTask = async (taskId: string) => {
    if (!auth.currentUser) return;
    const taskRef = doc(db, "users", auth.currentUser.uid, "studyPlan", taskId);
    await deleteDoc(taskRef);
  };

  const clearPlan = async () => {
    if (!auth.currentUser) return;
    // Note: This is a batch delete, but for simplicity we'll just delete them one by one or leave it for now
    // In a real app, you'd use a writeBatch
  };

  return { tasks, loading, addTask, toggleTask, deleteTask };
}
