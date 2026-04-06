"use client";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { ChevronLeft, Loader2, Lock, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function NoteDetailView({ noteId, isPremium, onBack, onNavigate }: { noteId: string, isPremium?: boolean, onBack: () => void, onNavigate?: (tab: string) => void }) {
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const noteRef = doc(db, "notes", noteId);
        const noteSnap = await getDoc(noteRef);
        
        if (noteSnap.exists()) {
          const data = noteSnap.data();
          setNote({ id: noteSnap.id, ...data });
        } else {
          setError("Note not found.");
        }
      } catch (err) {
        console.error("Error fetching note:", err);
        setError("Failed to load note.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-slate-500 font-medium text-sm">Loading note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="p-6 text-center space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ChevronLeft size={20} /> Back to Study Hub
        </button>
        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl font-medium">
          {error || "Note not found."}
        </div>
      </div>
    );
  }

  if (note.isPremiumOnly && !isPremium) {
    return (
      <div className="p-6 md:p-8 pt-12 max-w-3xl mx-auto font-sans h-full flex flex-col">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 w-fit">
          <ChevronLeft size={20} /> Back to Study Hub
        </button>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
          <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center shadow-inner">
            <Lock size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Premium Note</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              This note is available for premium users only. Please buy to download or view.
            </p>
          </div>
          <button 
            onClick={() => onNavigate?.('premium')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap size={20} fill="currentColor" />
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 pt-12 max-w-3xl mx-auto font-sans pb-32">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 w-fit">
        <ChevronLeft size={20} /> Back
      </button>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              {note.subject}
            </span>
            {note.isPremiumOnly && (
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1">
                <Lock size={10} /> Premium
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {note.topic}
          </h1>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-indigo-600 prose-li:text-slate-600 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.content || "*No content available for this note.*"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
