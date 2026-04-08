"use client";

import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import StudyHubView from "@/components/StudyHubView";
import { Loader2 } from "lucide-react";

export default function StudyHubPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const notesSnapshot = await getDocs(collection(db, "notes"));
        const notesData = notesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotes(notesData);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-black text-slate-900 mb-2">Public Study Hub</h1>
      <p className="text-slate-500 mb-8">Access high-quality study notes and summaries.</p>
      <StudyHubView initialNotes={notes} />
    </div>
  );
}
