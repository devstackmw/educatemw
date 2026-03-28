import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase";
import { FileText, Lock, Search, WifiOff, X } from "lucide-react";

interface Note {
  id: string;
  subject: string;
  topic: string;
  content: string;
  isPremiumOnly: boolean;
}

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    const q = query(collection(db, "notes"));
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const notesData: Note[] = [];
      snapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() } as Note);
      });
      setNotes(notesData);
      setIsOffline(snapshot.metadata.fromCache);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notes:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredNotes = notes.filter(note => 
    note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Study Notes</h2>
        {isOffline && (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
            <WifiOff size={12} /> Offline Mode
          </span>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search subjects or topics..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
          <FileText className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-gray-800 font-bold mb-1">No notes found</h3>
          <p className="text-gray-500 text-sm">
            {searchQuery ? "Try a different search term." : "Study notes will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredNotes.map((note) => (
            <div 
              key={note.id} 
              onClick={() => setSelectedNote(note)}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{note.topic}</h3>
                  <p className="text-xs text-gray-500">{note.subject}</p>
                </div>
              </div>
              {note.isPremiumOnly && (
                <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
                  <Lock size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Note Reader Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-200">
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="font-bold text-lg leading-tight">{selectedNote.topic}</h2>
              <p className="text-blue-100 text-xs">{selectedNote.subject}</p>
            </div>
            <button 
              onClick={() => setSelectedNote(null)}
              className="p-2 bg-blue-700 rounded-full hover:bg-blue-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {selectedNote.isPremiumOnly ? (
              <div className="bg-white border border-amber-200 rounded-2xl p-6 text-center shadow-sm mt-10">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Premium Content</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This study note is available to Premium members only. Upgrade to unlock all notes, past papers, and quizzes.
                </p>
                <button 
                  onClick={() => setSelectedNote(null)}
                  className="bg-amber-400 text-amber-950 font-bold py-3 px-6 rounded-xl w-full shadow-sm hover:bg-amber-500 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm prose prose-sm max-w-none">
                {/* Simple text rendering. In a real app, this might be Markdown */}
                {selectedNote.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
