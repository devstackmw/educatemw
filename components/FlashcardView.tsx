"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase";
import { Layers, ChevronRight, WifiOff, Search } from "lucide-react";
import { handleFirestoreError, OperationType } from "@/lib/firestoreError";
import LoadingScreen from "@/components/LoadingScreen";
import FlashcardStudy from "@/components/FlashcardStudy";

interface FlashcardSet {
  id: string;
  subject: string;
  topic: string;
  cardsCount: number;
  color: string;
  isPremiumOnly: boolean;
  fromCache?: boolean;
}

export default function FlashcardView() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = query(collection(db, "flashcardSets"));
    
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const fetchedSets: FlashcardSet[] = [];
      snapshot.forEach((doc) => {
        fetchedSets.push({ id: doc.id, ...doc.data(), fromCache: snapshot.metadata.fromCache } as FlashcardSet);
      });
      setSets(fetchedSets);
      setIsOffline(snapshot.metadata.fromCache);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "flashcardSets");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredSets = sets.filter(set => 
    set.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSet) {
    return <FlashcardStudy set={selectedSet} onClose={() => setSelectedSet(null)} />;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-800">Flashcards</h2>
        {isOffline && <WifiOff size={20} className="text-amber-500" />}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search topics or subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold">Loading sets...</p>
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Layers size={32} className="text-slate-300" />
          </div>
          <h4 className="font-black text-slate-800 mb-1">No sets found</h4>
          <p className="text-slate-400 text-xs font-medium">Try searching for something else.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSets.map(set => (
            <div 
              key={set.id} 
              onClick={() => setSelectedSet(set)}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className={`${set.color || 'bg-blue-600'} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform`}>
                  <Layers size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{set.subject}</span>
                    {set.isPremiumOnly && <span className="bg-amber-100 text-amber-800 text-[8px] px-2 py-0.5 rounded-full font-black">PRO</span>}
                  </div>
                  <h4 className="font-black text-slate-800 leading-tight mb-1">{set.topic}</h4>
                  <p className="text-xs text-slate-400 font-bold">{set.cardsCount} cards to review</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
