import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase";
import { X, Timer, CheckCircle, AlertCircle } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

interface Quiz {
  id: string;
  subject: string;
  topic: string;
  questionsCount: number;
  timeLimit: string; // e.g., "10 mins"
  color: string;
  isPremiumOnly: boolean;
}

export default function QuizSimulator({ quiz, onClose }: { quiz: Quiz, onClose: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  
  // Parse timeLimit string to minutes
  const timeLimitMinutes = parseInt(quiz.timeLimit) || 10;
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const q = query(collection(db, `quizzes/${quiz.id}/questions`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionsData: Question[] = [];
      snapshot.forEach((doc) => {
        questionsData.push({ id: doc.id, ...doc.data() } as Question);
      });
      setQuestions(questionsData);
    });
    return () => unsubscribe();
  }, [quiz.id]);

  const finishQuiz = useCallback(() => {
    setIsFinished(true);
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    // Here you would typically save the result to Firestore for the "true counting"
  }, [questions, userAnswers]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isFinished) {
      finishQuiz();
    }
  }, [timeLeft, isFinished, finishQuiz]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-white p-6 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Quiz Finished!</h2>
        <p className="text-xl mb-8">You scored {score} out of {questions.length}</p>
        <button onClick={onClose} className="bg-blue-600 text-white py-3 px-8 rounded-xl font-bold">Close</button>
      </div>
    );
  }

  if (questions.length === 0) return <div className="p-4">Loading questions...</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-200">
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-sm">
        <h2 className="font-bold text-lg">{quiz.topic}</h2>
        <div className="flex items-center gap-2 font-mono bg-blue-700 px-3 py-1 rounded-full">
          <Timer size={16} /> {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <h3 className="text-xl font-bold text-gray-800">{currentQuestion.text}</h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${userAnswers[currentQuestionIndex] === idx ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex gap-2">
        <button 
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          className="flex-1 py-3 rounded-xl font-bold border border-gray-300 text-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        {currentQuestionIndex < questions.length - 1 ? (
          <button 
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={finishQuiz}
            className="flex-1 py-3 rounded-xl font-bold bg-green-600 text-white"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
