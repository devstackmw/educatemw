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

export default function FlashcardView({ isPremium }: { isPremium?: boolean }) {
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
    <div className="p-6 md:p-8 pt-12 space-y-8 pb-32 max-w-3xl mx-auto font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Flashcards</h2>
        {isOffline && <WifiOff size={20} className="text-amber-500" />}
      </div>

      <AIFlashcardGenerator isPremium={isPremium} onSetGenerated={(set) => setSelectedSet(set)} />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Search topics or subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm outline-none"
        />
      </div>

      {loading ? (
        <FlashcardsSkeleton />
      ) : filteredSets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layers size={32} className="text-slate-300" />
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">No sets found</h4>
          <p className="text-slate-500 text-xs font-medium">Try searching for something else.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSets.map(set => (
            <div 
              key={set.id} 
              onClick={() => setSelectedSet(set)}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className={`${set.color || 'bg-indigo-600'} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform`}>
                  <Layers size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{set.subject}</span>
                    {set.isPremiumOnly && <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold">PRO</span>}
                  </div>
                  <h4 className="font-bold text-slate-900 text-base leading-tight mb-1">{set.topic}</h4>
                  <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                    <Layers size={12} /> {set.cardsCount} cards to review
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
