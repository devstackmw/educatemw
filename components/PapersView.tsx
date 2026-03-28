import { Download, Search, FileText, WifiOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebase";

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
    setLoading(true);
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
      console.error("Error fetching papers:", error);
      setLoading(false);
    });

    return () => unsubscribe();
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
        {["MSCE", "JCE", "PSLCE"].map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === level ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {isOffline && (
        <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-amber-100">
          <WifiOff size={14} />
          You are offline. Showing cached papers.
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No papers found for {filter}.
            {isOffline && " Connect to the internet to fetch more."}
          </div>
        ) : (
          papers.map(paper => (
            <div key={paper.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    {paper.subject}
                    {paper.isPremiumOnly && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">PRO</span>}
                  </h4>
                  <p className="text-xs text-gray-500">{paper.level} • {paper.year} • {paper.size}</p>
                </div>
              </div>
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <Download size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
