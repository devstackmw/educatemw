"use client";

import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";

export function generateStaticParams() {
  return [];
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.noteId as string;
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNote() {
      if (!noteId) return;
      try {
        const noteDoc = await getDoc(doc(db, "notes", noteId));
        if (!noteDoc.exists()) {
          router.push("/study-hub");
          return;
        }
        setNote(noteDoc.data());
      } catch (error) {
        console.error("Error fetching note:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [noteId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-black text-slate-900 mb-2">{note.topic}</h1>
      <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-6">{note.subject}</p>
      
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
      </div>
    </div>
  );
}
