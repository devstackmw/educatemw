import { PlayCircle, Clock, CheckCircle2, WifiOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase";

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

  useEffect(() => {
    setLoading(true);
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
      console.error("Error fetching quizzes:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-md">
        <h2 className="text-xl font-bold mb-2">Daily Challenge</h2>
        <p className="text-indigo-100 text-sm mb-4">Test your knowledge on MSCE Physical Science and earn points!</p>
        <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold w-full flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
          <PlayCircle size={18} /> Start Challenge
        </button>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
          Recommended Quizzes
          {isOffline && <WifiOff size={16} className="text-amber-500" />}
        </h3>
        
        {isOffline && (
          <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-amber-100 mb-3">
            <WifiOff size={14} />
            Offline mode. Showing cached quizzes.
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No quizzes available right now.
              {isOffline && " Connect to the internet to sync."}
            </div>
          ) : (
            quizzes.map(quiz => (
              <div key={quiz.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className={`${quiz.color || 'bg-indigo-500'} w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                  {quiz.subject[0]}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    {quiz.subject}
                    {quiz.isPremiumOnly && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">PRO</span>}
                  </h4>
                  <p className="text-xs text-gray-500">{quiz.topic}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {quiz.questionsCount} Qs</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {quiz.timeLimit}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                  <PlayCircle size={24} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
