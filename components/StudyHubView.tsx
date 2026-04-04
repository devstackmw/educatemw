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
    });
    return () => unsubscribe();
  }, []);

  const filteredNotes = notes.filter(note => 
    note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 pt-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><BookOpen size={24} /></div>
        <h2 className="font-bold text-xl text-slate-800 tracking-tight">Study Hub</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search notes by subject or topic..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map(note => (
          <Link href={`/study-hub/${note.id}`} key={note.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">{note.subject}</span>
              {note.isPremiumOnly && <Lock size={14} className="text-amber-500" />}
            </div>
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{note.topic}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
