import { Download, Search, FileText, Lock, Zap, ArrowUpDown, Filter, ChevronRight, ExternalLink, Sparkles, Calendar, BookOpen } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { PapersSkeleton } from "./Skeleton";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment, limit } from "firebase/firestore";
import { db } from "@/firebase";
import { motion, AnimatePresence } from "motion/react";

type SortOption = "newest" | "oldest" | "subject" | "popular" | "year";

export default function PapersView({ isPremium, onNavigate }: { isPremium?: boolean, onNavigate?: (tab: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Past Papers");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [resources, setResources] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch resources
    const qResources = query(collection(db, "resources"), orderBy("createdAt", "desc"), limit(100));
    const unsubResources = onSnapshot(qResources, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'resource' }));
      setResources(data);
    });

    // Fetch papers
    const qPapers = query(collection(db, "papers"), orderBy("createdAt", "desc"), limit(100));
    const unsubPapers = onSnapshot(qPapers, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        type: 'paper',
        category: 'Past Papers' // Ensure papers are categorized correctly
      }));
      setPapers(data);
      setLoading(false);
    });

    return () => {
      unsubResources();
      unsubPapers();
    };
  }, []);

  const allItems = useMemo(() => {
    return [...resources, ...papers];
  }, [resources, papers]);

  const getResourceColor = (category: string) => {
    switch (category) {
      case "Notes": return "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-500/20";
      case "Past Papers": return "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-500/20";
      case "Videos": return "from-purple-500/10 to-purple-500/5 text-purple-600 border-purple-500/20";
      default: return "from-slate-500/10 to-slate-500/5 text-slate-600 border-slate-500/20";
    }
  };

  const sortedAndFilteredItems = useMemo(() => {
    let filtered = allItems.filter(item => {
      const title = item.title || item.subject || "";
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "subject":
        filtered.sort((a, b) => {
          const titleA = (a.subject || a.title || "").toLowerCase();
          const titleB = (b.subject || b.title || "").toLowerCase();
          return titleA.localeCompare(titleB);
        });
        break;
      case "popular":
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case "year":
        filtered.sort((a, b) => (b.year || "").localeCompare(a.year || ""));
        break;
    }

    return filtered;
  }, [allItems, searchQuery, activeCategory, sortBy]);

  const handleLockedClick = () => {
    if (onNavigate) {
      onNavigate('premium');
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
    }
  };

  const handleItemClick = async (id: string, type: string) => {
    try {
      const collectionName = type === 'paper' ? 'papers' : 'resources';
      await updateDoc(doc(db, collectionName, id), {
        viewCount: increment(1)
      });
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  if (loading) {
    return <PapersSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-100 px-4 pt-6 pb-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Study Library</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Malawi MSCE & JCE Materials</p>
          </div>
          {!isPremium && (
            <button 
              onClick={handleLockedClick}
              className="bg-amber-400 text-slate-900 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
            >
              <Zap size={12} fill="currentColor" /> Upgrade
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject or title..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
              <Filter size={14} className="text-slate-400" />
            </div>
            {["Past Papers", "Notes", "Videos", "All"].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeCategory === cat 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-[10px] font-black text-slate-700 uppercase tracking-widest focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="subject">Subject (A-Z)</option>
                <option value="year">Year</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sortedAndFilteredItems.length} Items</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {!isPremium && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-[2rem] text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
                  <Sparkles size={16} fill="currentColor" />
                </div>
                <h3 className="font-black text-sm tracking-tight">Unlock Full Library</h3>
              </div>
              <p className="text-blue-100 text-[10px] font-medium leading-relaxed opacity-90 max-w-[80%]">Get instant access to 500+ past papers, premium notes, and expert video lessons.</p>
              <button 
                onClick={handleLockedClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Upgrade Now
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="popLayout">
            {sortedAndFilteredItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/40"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-slate-300" size={32} />
                </div>
                <h3 className="text-slate-800 font-black text-sm mb-1">No materials found</h3>
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Try adjusting your search or category</p>
              </motion.div>
            ) : (
              sortedAndFilteredItems.map((item, index) => (
                <ResourceCard 
                  key={item.id}
                  index={index}
                  title={item.title || item.subject} 
                  url={item.url || item.downloadUrl} 
                  category={item.category}
                  viewCount={item.viewCount || 0}
                  year={item.year}
                  level={item.level}
                  size={item.size}
                  colorClass={getResourceColor(item.category)}
                  isLocked={(item.isPremium || item.isPremiumOnly) && !isPremium}
                  onLockedClick={handleLockedClick}
                  onOpen={() => handleItemClick(item.id, item.type)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ 
  title, url, category, viewCount, year, level, size, colorClass, isLocked, onLockedClick, onOpen, index 
}: { 
  title: string, url: string, category: string, viewCount: number, year?: string, level?: string, size?: string, colorClass: string, isLocked: boolean, onLockedClick: () => void, onOpen: () => void, index: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      className={`group relative bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${
        isLocked 
        ? 'border-slate-100 opacity-90' 
        : 'border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10'
      }`}
    >
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br border ${isLocked ? 'from-slate-100 to-slate-50 text-slate-400 border-slate-200' : colorClass}`}>
            {isLocked ? <Lock size={20} /> : <FileText size={20} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${isLocked ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {category}
              </span>
              {year && (
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1">
                  <Calendar size={8} /> {year}
                </span>
              )}
              {!isLocked && viewCount > 50 && (
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500 flex items-center gap-0.5">
                  <Zap size={8} fill="currentColor" /> Popular
                </span>
              )}
            </div>
            <h3 className={`font-black text-sm tracking-tight truncate ${isLocked ? 'text-slate-400' : 'text-slate-900 group-hover:text-blue-600 transition-colors'}`}>
              {title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                <ExternalLink size={10} /> {viewCount} views
              </span>
              {size && (
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                  <BookOpen size={10} /> {size}
                </span>
              )}
              {level && (
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{level}</span>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {isLocked ? (
            <button 
              onClick={onLockedClick}
              className="bg-amber-400 text-slate-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-400/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Lock size={12} /> Pay Now
            </button>
          ) : (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={onOpen}
              className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all group-hover:scale-110"
            >
              <Download size={18} />
            </a>
          )}
        </div>
      </div>

      {/* Progress Bar Decoration */}
      {!isLocked && (
        <div className="absolute bottom-0 left-0 h-1 bg-blue-600/10 w-full">
          <div className="h-full bg-blue-600 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
        </div>
      )}
    </motion.div>
  );
}
