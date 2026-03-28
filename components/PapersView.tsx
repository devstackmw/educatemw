import { Download, Search, FileText, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firestoreError";
import LoadingScreen from "@/components/LoadingScreen";

interface Paper {
  id: string;
  subject: string;
  year: string;
  level: string;
  size: string;
  downloadUrl: string;
  isPremiumOnly: boolean;
  fromCache?: boolean;
}

export default function PapersView() {
  const [filter, setFilter] = useState("MSCE");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(true), 0);
    const q = query(collection(db, "papers"), where("level", "==", filter));
    
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const fetchedPapers: Paper[] = [];
      snapshot.forEach((doc) => {
        fetchedPapers.push({ id: doc.id, ...doc.data(), fromCache: snapshot.metadata.fromCache } as Paper);
      });
      setPapers(fetchedPapers);
      setIsOffline(snapshot.metadata.fromCache);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "papers");
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [filter]);

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search subjects or years..."
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {["MSCE", "JCE", "PSLCE", "Notes"].map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              filter === level ? "bg-blue-900 text-white shadow-md" : "bg-white text-slate-600 border border-slate-100 hover:border-blue-200"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {filter === "Notes" ? (
        <div className="space-y-4">
          <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-600/20 mb-6">
            <h3 className="font-black text-lg mb-1">Study Notes</h3>
            <p className="text-blue-100 text-xs font-medium opacity-80">Direct access to Google Drive study materials.</p>
          </div>
          
          <NoteLink 
            title="Chemistry Notes" 
            url="https://drive.google.com/drive/folders/1oqBNZAKDbPm3Wv1K1CyzOIWSXclzM-YZ" 
            color="bg-emerald-50 text-emerald-600 border-emerald-100"
          />
          <NoteLink 
            title="Biology Notes" 
            url="https://drive.google.com/drive/folders/1IPDdImZt98qhBe-dZwTJK-JLXIvQ3gKs" 
            color="bg-rose-50 text-rose-600 border-rose-100"
          />
          <NoteLink 
            title="Mathematics Notes" 
            url="https://drive.google.com/drive/folders/1nAgjHKIKU1TWMMj7YCpGSG8j5WYxz5gv" 
            color="bg-indigo-50 text-indigo-600 border-indigo-100"
          />
        </div>
      ) : (
        <>
          {isOffline && (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-xs flex items-center gap-2 border border-amber-100">
              <WifiOff size={14} />
              You are offline. Showing cached papers.
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <LoadingScreen message="Fetching papers..." />
            ) : papers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
                <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                <h3 className="text-slate-800 font-bold mb-1">No papers found</h3>
                <p className="text-slate-500 text-sm">
                  No papers found for {filter}.
                  {isOffline && " Connect to the internet to fetch more."}
                </p>
              </div>
            ) : (
              papers.map(paper => (
                <div key={paper.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        {paper.subject}
                        {paper.isPremiumOnly && <span className="bg-amber-50 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold">PRO</span>}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{paper.level} • {paper.year} • {paper.size}</p>
                    </div>
                  </div>
                  <button className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors">
                    <Download size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function NoteLink({ title, url, color }: { title: string, url: string, color: string }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center justify-between p-5 rounded-3xl border transition-all hover:shadow-md active:scale-[0.98] ${color}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <FileText size={22} />
        </div>
        <span className="font-black text-sm">{title}</span>
      </div>
      <Download size={20} />
    </a>
  );
}
