import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function NoteDetailPage({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params;
  const noteDoc = await adminDb.collection("notes").doc(noteId).get();
  
  if (!noteDoc.exists) {
    notFound();
  }

  const note = noteDoc.data();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-black text-slate-900 mb-2">{note?.topic}</h1>
      <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-6">{note?.subject}</p>
      
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note?.content}</ReactMarkdown>
      </div>
    </div>
  );
}
