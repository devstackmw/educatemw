import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, HelpCircle, Sparkles, Trophy, ChevronRight, Check } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { User as FirebaseUser } from "firebase/auth";

const steps = [
  {
    id: "welcome",
    title: "Welcome to Educate MW",
    description: "Your ultimate companion for MSCE success. Let's get you set up for top grades.",
    icon: <Trophy size={48} className="text-amber-500" />,
    color: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    id: "papers",
    title: "Past Papers & Notes",
    description: "Access a massive library of MSCE past papers and study notes to prepare effectively.",
    icon: <BookOpen size={48} className="text-blue-500" />,
    color: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    id: "quizzes",
    title: "Interactive Quizzes",
    description: "Test your knowledge with gamified quizzes and track your progress on the leaderboard.",
    icon: <HelpCircle size={48} className="text-purple-500" />,
    color: "bg-purple-50 dark:bg-purple-500/10",
  },
  {
    id: "ai",
    title: "AI Teacher",
    description: "Stuck on a problem? Ask our AI teacher for step-by-step explanations anytime.",
    icon: <Sparkles size={48} className="text-emerald-500" />,
    color: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    id: "premium",
    title: "Unlock Your Potential",
    description: "Get unlimited access to all features, premium notes, and AI assistance.",
    icon: <Trophy size={48} className="text-rose-500" />,
    color: "bg-rose-50 dark:bg-rose-500/10",
    isPremiumPrompt: true,
  }
];

export default function OnboardingView({ user, onComplete, onNavigate }: { user: FirebaseUser, onComplete: () => void, onNavigate: (tab: string) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = async (goToPremium: boolean = false) => {
    if (isCompleting) return;
    setIsCompleting(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        hasCompletedOnboarding: true
      });
      onComplete();
      if (goToPremium) {
        onNavigate("premium");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsCompleting(false);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex flex-col">
      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center max-w-sm w-full"
          >
            <div className={`w-32 h-32 rounded-full ${step.color} flex items-center justify-center mb-8 shadow-inner`}>
              {step.icon}
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {step.title}
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {step.description}
            </p>

            {step.isPremiumPrompt && (
              <div className="mt-8 w-full space-y-3">
                <button
                  onClick={() => handleComplete(true)}
                  disabled={isCompleting}
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  Upgrade to Premium
                </button>
                <button
                  onClick={() => handleComplete(false)}
                  disabled={isCompleting}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl active:scale-95 transition-all"
                >
                  Continue Free
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {!step.isPremiumPrompt && (
        <div className="p-6 pb-8">
          <button
            onClick={handleNext}
            className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
