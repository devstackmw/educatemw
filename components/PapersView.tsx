import { Download, Search, FileText, Lock, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { PapersSkeleton } from "./Skeleton";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";

export default function PapersView({ isPremium, onNavigate }: { isPremium?: boolean, onNavigate?: (tab: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Notes");
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResources(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getResourceColor = (category: string) => {
    switch (category) {
      case "Notes": return "bg-emerald-50 text-emerald-600";
      case "Past Papers": return "bg-amber-50 text-amber-600";
      case "Videos": return "bg-purple-50 text-purple-600";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  if (loading) {
    return <PapersSkeleton />;
  }

  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
    (activeCategory === "All" || res.category === activeCategory)
  );

  const handleLockedClick = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search materials..."
          className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {["Notes", "Past Papers", "Videos", "All"].map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat 
              ? "bg-blue-900 text-white shadow-sm" 
              : "bg-white text-slate-600 border border-slate-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="bg-blue-600 p-5 rounded-xl text-white shadow-md shadow-blue-600/10 mb-4">
          <h3 className="font-bold text-base mb-0.5">Study Library</h3>
          <p className="text-blue-100 text-[10px] font-medium opacity-80">Premium access to Google Drive study materials and past papers.</p>
        </div>
        
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-slate-100 shadow-sm">
            <FileText className="mx-auto text-slate-300 mb-2" size={32} />
            <h3 className="text-slate-800 font-bold text-sm mb-0.5">No materials found</h3>
            <p className="text-slate-500 text-xs">Try adjusting your search or category.</p>
          </div>
        ) : (
          filteredResources.map((res) => (
            <NoteLink 
              key={res.id}
              title={res.title} 
              url={res.url} 
              color={getResourceColor(res.category)}
              isLocked={res.isPremium && !isPremium}
              onLockedClick={handleLockedClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NoteLink({ title, url, color, isLocked, onLockedClick }: { title: string, url: string, color: string, isLocked: boolean, onLockedClick: () => void }) {
  const content = (
    <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isLocked ? 'bg-slate-50 text-slate-400 border-slate-200 grayscale' : `hover:shadow-md active:scale-[0.98] ${color} border-transparent`}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl shadow-sm ${isLocked ? 'bg-slate-200' : 'bg-white'}`}>
          {isLocked ? <Lock size={20} /> : <FileText size={20} />}
        </div>
        <div className="flex flex-col">
          <span className={`font-bold text-sm ${isLocked ? 'text-slate-500' : 'text-slate-800'}`}>{title}</span>
          {isLocked && (
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock size={10} />
                Premium Only
              </span>
            </div>
          )}
        </div>
      </div>
      {!isLocked && <Download size={20} className="text-slate-400" />}
    </div>
  );

  if (isLocked) {
    return (
      <div onClick={onLockedClick} className="w-full text-left cursor-pointer">
        {content}
      </div>
    );
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block"
    >
      {content}
    </a>
  );
}
