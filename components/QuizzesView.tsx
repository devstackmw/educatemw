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
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const q = query(collection(db, "quizzes"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const fetchedQuizzes: Quiz[] = [ENGLISH_STARTER_QUIZ as any, BIOLOGY_STARTER_QUIZ as any];
      snapshot.forEach((doc) => {
        // Avoid duplicates if starter quizzes are also in Firestore
        if (doc.id !== 'english_starter' && doc.id !== 'biology_starter') {
          fetchedQuizzes.push({ id: doc.id, ...doc.data(), fromCache: snapshot.metadata.fromCache } as Quiz);
        }
      });
      setQuizzes(fetchedQuizzes);
      setIsOffline(snapshot.metadata.fromCache);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "quizzes");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Quizzes</h2>
        {isOffline && <WifiOff size={18} className="text-amber-500" />}
      </div>

      <AIQuizGenerator isPremium={isPremium} onQuizGenerated={(quiz) => setSelectedQuiz(quiz)} />

      {loading ? (
        <QuizzesSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {quizzes.map((quiz) => (
            <div 
              key={quiz.id} 
              onClick={() => setSelectedQuiz(quiz)}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`${quiz.color || 'bg-indigo-600'} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform`}>
                  <BookOpen size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">{quiz.subject}</span>
                    {quiz.isPremiumOnly && <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight mb-0.5">{quiz.topic}</h4>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock size={10} /> {quiz.timeLimit}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={10} /> {quiz.questionsCount} Questions
                    </p>
                  </div>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  <PlayCircle size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedQuiz && (
        <QuizSimulator quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
      )}
    </div>
  );
}
