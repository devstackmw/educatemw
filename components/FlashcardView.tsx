"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase";
import { Layers, ChevronRight, WifiOff, Search, Sparkles } from "lucide-react";
import { handleFirestoreError, OperationType } from "@/lib/firestoreError";
import { FlashcardsSkeleton } from "./Skeleton";
import FlashcardStudy from "@/components/FlashcardStudy";
import AIFlashcardGenerator from "@/components/AIFlashcardGenerator";

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
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Flashcards</h2>
        {isOffline && <WifiOff size={18} className="text-amber-500" />}
      </div>

      <AIFlashcardGenerator onSetGenerated={(set) => setSelectedSet(set)} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text"
          placeholder="Search topics or subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-100 border-none rounded-lg py-3 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {loading ? (
        <FlashcardsSkeleton />
      ) : filteredSets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Layers size={24} className="text-slate-300" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">No sets found</h4>
          <p className="text-slate-400 text-[10px] font-medium">Try searching for something else.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredSets.map(set => (
            <div 
              key={set.id} 
              onClick={() => setSelectedSet(set)}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`${set.color || 'bg-blue-600'} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform`}>
                  <Layers size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{set.subject}</span>
                    {set.isPremiumOnly && <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight mb-0.5">{set.topic}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">{set.cardsCount} cards to review</p>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
