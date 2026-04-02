import { PlayCircle, Clock, CheckCircle2, WifiOff, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import QuizSimulator from "@/components/QuizSimulator";
import AIQuizGenerator from "@/components/AIQuizGenerator";
import { handleFirestoreError, OperationType } from "@/lib/firestoreError";
import { QuizzesSkeleton } from "./Skeleton";

interface Quiz {
  id: string;
  subject: string;
  topic: string;
  questionsCount: number;
  timeLimit: string;
  color: string;
  isPremiumOnly: boolean;
  fromCache?: boolean;
}

export default function QuizzesView() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(true), 0);
    const q = query(collection(db, "quizzes"));
    
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const fetchedQuizzes: Quiz[] = [];
      snapshot.forEach((doc) => {
        fetchedQuizzes.push({ id: doc.id, ...doc.data(), fromCache: snapshot.metadata.fromCache } as Quiz);
      });
      setQuizzes(fetchedQuizzes);
      setIsOffline(snapshot.metadata.fromCache);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "quizzes");
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return (
    <div className="p-4 space-y-6">
      <AIQuizGenerator onQuizGenerated={(quiz) => setSelectedQuiz(quiz)} />

      <div className="bg-indigo-600 rounded-xl p-5 text-white shadow-md shadow-indigo-600/10">
        <h2 className="text-xl font-bold mb-1">Daily Challenge</h2>
        <p className="text-indigo-100 text-xs mb-4 font-medium opacity-90">Test your knowledge on MSCE Physical Science and earn points!</p>
        <button className="bg-white text-indigo-600 px-4 py-2.5 rounded-lg text-xs font-bold w-full flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-[0.98]">
          <PlayCircle size={16} /> Start Challenge
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between px-1 mb-3">
          <h3 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest">Recommended</h3>
          {isOffline && <WifiOff size={14} className="text-amber-500" />}
        </div>
        
        {isOffline && (
          <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-[10px] flex items-center gap-2 border border-amber-100 mb-3">
            <WifiOff size={12} />
            Offline mode. Showing cached quizzes.
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <QuizzesSkeleton />
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-xs font-bold">No quizzes available right now.</p>
              {isOffline && <p className="text-slate-300 text-[9px] mt-1.5">Connect to the internet to sync.</p>}
            </div>
          ) : (
            quizzes.map(quiz => (
              <div key={quiz.id} onClick={() => setSelectedQuiz(quiz)} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-200 transition-all group active:scale-[0.98]">
                <div className={`${quiz.color || 'bg-indigo-500'} w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-600/10 group-hover:scale-105 transition-transform`}>
                  {quiz.subject[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{quiz.subject}</span>
                    {quiz.isPremiumOnly && <span className="bg-amber-100 text-amber-800 text-[7px] px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
                  </div>
                  <h4 className="font-bold text-slate-800 leading-tight mb-0.5 text-sm">{quiz.topic}</h4>
                  <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><CheckCircle2 size={10} /> {quiz.questionsCount} Qs</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {quiz.timeLimit}</span>
                  </div>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  <PlayCircle size={20} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {selectedQuiz && (
        <QuizSimulator quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
      )}
    </div>
  );
}
