import { Download, Search, FileText, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { PapersSkeleton } from "./Skeleton";

export default function PapersView({ isPremium, onNavigate }: { isPremium?: boolean, onNavigate?: (tab: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Notes");

  useEffect(() => {
    // Simulate loading for better UX transition
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const notes = [
    { title: "Chemistry Notes", url: "https://drive.google.com/drive/folders/1oqBNZAKDbPm3Wv1K1CyzOIWSXclzM-YZ", color: "bg-emerald-50 text-emerald-600 border-emerald-100", premium: true, category: "Notes" },
    { title: "Biology Notes", url: "https://drive.google.com/drive/folders/1IPDdImZt98qhBe-dZwTJK-JLXIvQ3gKs", color: "bg-rose-50 text-rose-600 border-rose-100", premium: true, category: "Notes" },
    { title: "Mathematics Notes", url: "https://drive.google.com/drive/folders/1nAgjHKIKU1TWMMj7YCpGSG8j5WYxz5gv", color: "bg-indigo-50 text-indigo-600 border-indigo-100", premium: true, category: "Notes" },
    { title: "Agriculture Notes", url: "https://drive.google.com/drive/folders/1--BbSZ9zbtiAXVKYhiaJ9FIjgl-Uxjt5", color: "bg-orange-50 text-orange-600 border-orange-100", premium: true, category: "Notes" },
    { title: "Geography Notes", url: "https://drive.google.com/drive/folders/1jj64lf2kWEAhvrhmV-SKGGrHF67H6Mxg", color: "bg-emerald-50 text-emerald-600 border-emerald-100", premium: true, category: "Notes" },
    { title: "Social Studies Notes", url: "https://drive.google.com/drive/folders/1gKB6neWwy_XG2mujGu07asw7FDkgtX4I", color: "bg-blue-50 text-blue-600 border-blue-100", premium: true, category: "Notes" },
    { title: "Physics Notes", url: "https://drive.google.com/drive/folders/1OMJ_UAboIvKS7frqnfk-Bm9mbbrrAYwT", color: "bg-purple-50 text-purple-600 border-purple-100", premium: true, category: "Notes" },
    { title: "Life Skills Notes", url: "https://drive.google.com/drive/folders/1H2dQeiekRq903lDS8_Aa4LeQTxnw9Blj", color: "bg-pink-50 text-pink-600 border-pink-100", premium: true, category: "Notes" },
    { title: "2025 MANEB Past Papers", url: "https://drive.google.com/drive/folders/181_aToIbTtDmA-_I2vGAyIWvraZKk6ne", color: "bg-amber-50 text-amber-600 border-amber-100", premium: true, category: "Past Papers" }
  ];

  if (loading) {
    return <PapersSkeleton />;
  }

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
    (activeCategory === "All" || note.category === activeCategory)
  );

  const handleLockedClick = () => {
    if (onNavigate) onNavigate("premium");
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
        {["Notes", "Past Papers", "All"].map((cat) => (
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
        
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-slate-100 shadow-sm">
            <FileText className="mx-auto text-slate-300 mb-2" size={32} />
            <h3 className="text-slate-800 font-bold text-sm mb-0.5">No materials found</h3>
            <p className="text-slate-500 text-xs">Try adjusting your search or category.</p>
          </div>
        ) : (
          filteredNotes.map((note, idx) => (
            <NoteLink 
              key={idx}
              title={note.title} 
              url={note.url} 
              color={note.color}
              isLocked={note.premium && !isPremium}
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
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isLocked ? 'bg-slate-50 text-slate-400 border-slate-200 grayscale' : `hover:shadow-sm active:scale-[0.98] ${color}`}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg shadow-sm ${isLocked ? 'bg-slate-200' : 'bg-white'}`}>
          {isLocked ? <Lock size={18} /> : <FileText size={18} />}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs">{title}</span>
          {isLocked && <span className="text-[8px] font-bold uppercase tracking-widest text-amber-600">Pro Feature</span>}
        </div>
      </div>
      {!isLocked && <Download size={16} />}
    </div>
  );

  if (isLocked) {
    return (
      <button onClick={onLockedClick} className="w-full text-left">
        {content}
      </button>
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
