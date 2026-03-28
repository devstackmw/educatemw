"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase";
import { X, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { handleFirestoreError, OperationType } from "@/lib/firestoreError";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardSet {
  id: string;
  subject: string;
  topic: string;
  cardsCount: number;
  color: string;
  isPremiumOnly: boolean;
}

export default function FlashcardStudy({ set, onClose }: { set: FlashcardSet, onClose: () => void }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const q = query(collection(db, `flashcardSets/${set.id}/cards`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cardsData: Flashcard[] = [];
      snapshot.forEach((doc) => {
        cardsData.push({ id: doc.id, ...doc.data() } as Flashcard);
      });
      setCards(cardsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `flashcardSets/${set.id}/cards`);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [set.id]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Preparing your flashcards...</p>
      </div>
    </div>
  );

  if (cards.length === 0) return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-xs">
        <p className="text-slate-500 font-medium mb-6">No flashcards found for this topic yet.</p>
        <button onClick={onClose} className="bg-blue-600 text-white py-3 px-8 rounded-2xl font-black shadow-lg shadow-blue-600/20">Go Back</button>
      </div>
    </div>
  );

  if (isFinished) return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Set Complete!</h2>
      <p className="text-slate-500 mb-10">You&apos;ve reviewed all {cards.length} cards in this set. Great job!</p>
      <div className="flex flex-col w-full gap-4">
        <button onClick={handleRestart} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
          <RotateCcw size={20} /> Study Again
        </button>
        <button onClick={onClose} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">
          Finish Session
        </button>
      </div>
    </div>
  );

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col sm:max-w-md sm:mx-auto sm:border-x sm:border-slate-200">
      {/* Header */}
      <div className="bg-white p-6 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
          <div>
            <h2 className="font-black text-slate-800 text-sm leading-tight">{set.topic}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{set.subject}</p>
          </div>
        </div>
        <div className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-200 w-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card Area */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div 
          className="relative w-full aspect-[3/4] cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="w-full h-full relative preserve-3d transition-transform duration-500"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 flex flex-col items-center justify-center text-center">
              <span className="absolute top-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Question</span>
              <h3 className="text-2xl font-black text-slate-800 leading-tight">{currentCard.front}</h3>
              <p className="absolute bottom-8 text-xs font-bold text-blue-600/50 animate-pulse">Tap to reveal answer</p>
            </div>

            {/* Back */}
            <div 
              className="absolute inset-0 backface-hidden bg-blue-600 rounded-[2.5rem] shadow-xl p-10 flex flex-col items-center justify-center text-center text-white rotate-y-180"
            >
              <span className="absolute top-8 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Answer</span>
              <div className="overflow-y-auto max-h-full py-4">
                <p className="text-xl font-bold leading-relaxed">{currentCard.back}</p>
              </div>
              <p className="absolute bottom-8 text-xs font-bold text-white/40">Tap to see question</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-4 bg-slate-100 text-slate-600 rounded-2xl disabled:opacity-30 transition-all active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>

        <button 
          onClick={handleNext}
          className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {currentIndex === cards.length - 1 ? "Finish" : "Next Card"}
          <ChevronRight size={20} />
        </button>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
