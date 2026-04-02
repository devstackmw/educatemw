import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query, doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { X, Timer, CheckCircle, AlertCircle, Trophy, Star, Award, Zap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  subject: string;
  topic: string;
  questionsCount: number;
  timeLimit: string; // e.g., "10 mins"
  color: string;
  isPremiumOnly: boolean;
  questions?: Question[];
}

export default function QuizSimulator({ quiz, onClose }: { quiz: Quiz, onClose: () => void }) {
  const [questions, setQuestions] = useState<Question[]>(quiz.questions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Parse timeLimit string to minutes
  const timeLimitMinutes = parseInt(quiz.timeLimit) || 10;
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quiz.questions && quiz.questions.length > 0) {
      return;
    }

    const q = query(collection(db, `quizzes/${quiz.id}/questions`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionsData: Question[] = [];
      snapshot.forEach((doc) => {
        questionsData.push({ id: doc.id, ...doc.data() } as Question);
      });
      setQuestions(questionsData);
    });
    return () => unsubscribe();
  }, [quiz.id, quiz.questions]);

  const finishQuiz = useCallback(async () => {
    if (isFinished) return;
    setIsFinished(true);
    setSaving(true);

    const totalPoints = score * 10;
    setEarnedPoints(totalPoints);

    const user = auth.currentUser;
    if (user) {
      const statsRef = doc(db, "userStats", user.uid);
      try {
        const statsDoc = await getDoc(statsRef);
        const badgesToAward: string[] = [];

        // Logic for badges
        if (score === questions.length && questions.length > 0) {
          badgesToAward.push("quiz_master");
          setNewBadge("Quiz Master");
        }
        
        if (totalPoints >= 100) {
          const currentBadges = statsDoc.exists() ? (statsDoc.data().earnedBadges || []) : [];
          if (!currentBadges.includes("rising_star")) {
            badgesToAward.push("rising_star");
            setNewBadge(prev => prev ? `${prev} & Rising Star` : "Rising Star");
          }
        }

        if (statsDoc.exists()) {
          await updateDoc(statsRef, {
            points: increment(totalPoints),
            lastActiveDate: new Date().toISOString().split('T')[0],
            earnedBadges: arrayUnion(...badgesToAward)
          });
        } else {
          await setDoc(statsRef, {
            uid: user.uid,
            displayName: user.displayName || "Student",
            photoURL: user.photoURL || "",
            points: totalPoints,
            streak: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            earnedBadges: badgesToAward
          });
        }
      } catch (error) {
        console.error("Error saving quiz stats:", error);
      }
    }
    setSaving(false);
  }, [questions, score, isFinished]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isFinished) {
      const timer = setTimeout(() => finishQuiz(), 0);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isFinished, finishQuiz]);

  const handleAnswer = (optionIndex: number) => {
    if (showFeedback) return;

    const correct = optionIndex === questions[currentQuestionIndex].correctAnswerIndex;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);

    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setIsCorrect(null);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-white text-center"
      >
        <div className="bg-white/10 p-8 rounded-[3rem] border border-white/10 max-w-sm w-full space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/20">
            <Trophy size={48} className="text-white" />
          </div>
          
          <div>
            <h2 className="text-3xl font-black mb-2">Quiz Finished!</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Your Performance</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-2xl font-black text-blue-400">{score}/{questions.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-2xl font-black text-green-400">+{earnedPoints}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Points</p>
            </div>
          </div>

          <AnimatePresence>
            {newBadge && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-2xl flex items-center gap-3 text-left"
              >
                <div className="bg-white/20 p-2 rounded-xl">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">New Badge Earned!</p>
                  <p className="font-black text-sm">{newBadge}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={onClose} 
            disabled={saving}
            className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Preparing Questions...</p>
      </div>
    </div>
  );

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between">
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz.subject}</span>
          <h2 className="font-black text-slate-800">{quiz.topic}</h2>
        </div>
        <div className="flex items-center gap-2 font-mono bg-slate-900 text-white px-4 py-2 rounded-2xl text-sm font-bold">
          <Timer size={16} className="text-blue-400" /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-200 w-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">
            {currentQuestion.text}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = userAnswers[currentQuestionIndex] === idx;
            const isCorrectOption = idx === currentQuestion.correctAnswerIndex;
            
            let buttonClass = "border-white bg-white text-slate-600 hover:border-blue-200 shadow-sm";
            if (showFeedback) {
              if (isCorrectOption) {
                buttonClass = "border-green-500 bg-green-50 text-green-900";
              } else if (isSelected && !isCorrectOption) {
                buttonClass = "border-rose-500 bg-rose-50 text-rose-900";
              } else {
                buttonClass = "border-white bg-white text-slate-300 opacity-50";
              }
            } else if (isSelected) {
              buttonClass = "border-blue-600 bg-blue-50 text-blue-900";
            }

            return (
              <button
                key={idx}
                disabled={showFeedback}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-5 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${buttonClass}`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
                    isSelected 
                      ? (showFeedback ? (isCorrectOption ? 'bg-green-600' : 'bg-rose-600') : 'bg-blue-600') 
                      : (showFeedback && isCorrectOption ? 'bg-green-600' : 'bg-slate-100 text-slate-400')
                  } ${isSelected || (showFeedback && isCorrectOption) ? 'text-white' : ''}`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="font-bold flex-1">{option}</span>
                  {showFeedback && isCorrectOption && <CheckCircle size={20} className="text-green-600" />}
                  {showFeedback && isSelected && !isCorrectOption && <AlertCircle size={20} className="text-rose-600" />}
                </div>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-[2rem] flex items-center gap-4 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}
            >
              <div className={`p-3 rounded-2xl ${isCorrect ? 'bg-green-200' : 'bg-rose-200'}`}>
                {isCorrect ? <Zap size={24} className="animate-bounce" /> : <AlertCircle size={24} />}
              </div>
              <div>
                <p className="font-black text-lg">{isCorrect ? 'Brilliant!' : 'Not quite right'}</p>
                <p className="text-sm font-medium opacity-80">
                  {isCorrect ? 'You got it correct. Keep going!' : `The correct answer was option ${String.fromCharCode(65 + currentQuestion.correctAnswerIndex)}.`}
                </p>
                {currentQuestion.explanation && (
                  <p className="text-[10px] mt-2 font-bold bg-black/10 p-2 rounded-lg italic">
                    {currentQuestion.explanation}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
        {!showFeedback ? (
          <div className="flex-1 text-center py-4 text-slate-400 font-bold text-sm italic">
            Select an answer to continue
          </div>
        ) : (
          <>
            {currentQuestionIndex < questions.length - 1 ? (
              <button 
                onClick={nextQuestion}
                className="w-full py-4 rounded-2xl font-black bg-slate-900 text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Next Question <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={finishQuiz}
                className="w-full py-4 rounded-2xl font-black bg-green-600 text-white shadow-xl shadow-green-600/20 transition-all active:scale-95"
              >
                Finish & See Results
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
