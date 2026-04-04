import { PlayCircle, Clock, CheckCircle2, WifiOff, Sparkles, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import QuizSimulator from "@/components/QuizSimulator";
import AIQuizGenerator from "@/components/AIQuizGenerator";
import { handleFirestoreError, OperationType } from "@/lib/firestoreError";
import { QuizzesSkeleton } from "./Skeleton";
import { ENGLISH_STARTER_QUIZ, BIOLOGY_STARTER_QUIZ } from "@/lib/starterQuizzes";

interface Quiz {
  id: string;
  subject: string;
  topic: string;
  questionsCount: number;
  timeLimit: string;
  color: string;
  isPremiumOnly: boolean;
  fromCache?: boolean;
  questions?: any[];
}

export default function QuizzesView({ isPremium }: { isPremium?: boolean }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([ENGLISH_STARTER_QUIZ as any, BIOLOGY_STARTER_QUIZ as any]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  return (
    <div className="p-4 space-y-6">
      <AIQuizGenerator isPremium={isPremium} onQuizGenerated={(quiz) => setSelectedQuiz(quiz)} />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-600 rounded-xl p-5 text-white shadow-md shadow-indigo-600/10 relative overflow-hidden">
          <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-200" />
            English
          </h2>
          <button 
            onClick={() => setSelectedQuiz(ENGLISH_STARTER_QUIZ as any)}
            className="bg-white text-indigo-600 px-3 py-2 rounded-lg text-[10px] font-black w-full flex items-center justify-center gap-1 hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/20 mt-2"
          >
            <PlayCircle size={14} /> Start
          </button>
        </div>
        <div className="bg-emerald-600 rounded-xl p-5 text-white shadow-md shadow-emerald-600/10 relative overflow-hidden">
          <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
            <BookOpen size={16} className="text-emerald-200" />
            Biology
          </h2>
          <button 
            onClick={() => setSelectedQuiz(BIOLOGY_STARTER_QUIZ as any)}
            className="bg-white text-emerald-600 px-3 py-2 rounded-lg text-[10px] font-black w-full flex items-center justify-center gap-1 hover:bg-emerald-50 transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20 mt-2"
          >
            <PlayCircle size={14} /> Start
          </button>
        </div>
      </div>
      {selectedQuiz && (
        <QuizSimulator quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
      )}
    </div>
  );
}
