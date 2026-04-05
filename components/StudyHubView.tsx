"use client";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import { BookOpen, Lock, Search } from "lucide-react";
import Link from "next/link";

interface Note {
  id: string;
  subject: string;
  topic: string;
  isPremiumOnly: boolean;
}

export default function StudyHubView({ initialNotes = [] }: { initialNotes?: any[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "notes"), orderBy("subject"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(notesData);
    }, (error) => {
      console.error("Firestore Error in StudyHubView:", error);
    });
    return () => unsubscribe();
  }, []);

  const filteredNotes = notes.filter(note => 
    note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 pt-12 space-y-8 pb-32 max-w-3xl mx-auto font-sans">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl"><BookOpen size={28} /></div>
        <h2 className="font-heading font-black text-3xl text-slate-900 tracking-tight">Study Hub</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search notes by subject or topic..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map(note => (
          <Link href={`/study-hub/${note.id}`} key={note.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{note.subject}</span>
              {note.isPremiumOnly && <Lock size={16} className="text-amber-500" />}
            </div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors leading-tight">{note.topic}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
