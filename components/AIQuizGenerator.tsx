"use client";
import { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Loader2, X, PlayCircle, ChevronRight, BookOpen, GraduationCap, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { CURRICULUM, Subject, Topic } from "@/lib/curriculum";

export default function AIQuizGenerator({ isPremium, onQuizGenerated }: { isPremium?: boolean, onQuizGenerated: (quiz: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"form" | "subject" | "topic" | "generating">("form");
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const forms = ["Form 1", "Form 2", "Form 3", "Form 4"];

  const reset = () => {
    setStep("form");
    setSelectedForm("");
    setSelectedSubject(null);
    setSelectedTopic(null);
    setError("");
  };

  const generateQuiz = async () => {
    if (!isPremium) {
      setError("AI Quiz Generation is a PRO feature. Upgrade to unlock!");
      return;
    }
    if (!selectedTopic || !selectedSubject || !selectedForm) return;
    setStep("generating");
    setLoading(true);
    setError("");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a 5-question multiple choice quiz for ${selectedForm} students in Malawi on the subject ${selectedSubject.name} and topic: ${selectedTopic.name}. 
        The questions should be based on the Malawi National Examinations Board (MANEB) standards and past MSCE/JCE exam patterns.
        Focus on examinable concepts.
        Return the quiz in JSON format with fields: subject, topic, questions (array of objects with text, options (array of 4), and correctAnswerIndex).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswerIndex: { type: Type.INTEGER }
                  },
                  required: ["text", "options", "correctAnswerIndex"]
                }
              }
            },
            required: ["subject", "topic", "questions"]
          }
        }
      });

      const quizText = response.text;
      if (!quizText) throw new Error("No response from AI");
      const quizData = JSON.parse(quizText);
      
      // Save to Firestore so it can be played
      const quizRef = await addDoc(collection(db, "quizzes"), {
        subject: quizData.subject,
        topic: quizData.topic,
        questionsCount: quizData.questions.length,
        timeLimit: "5 mins",
        color: "bg-indigo-600",
        isPremiumOnly: false,
        isAIGenerated: true,
        form: selectedForm,
        createdAt: new Date().toISOString()
      });

      for (const q of quizData.questions) {
        await addDoc(collection(db, `quizzes/${quizRef.id}/questions`), q);
      }

      onQuizGenerated({ id: quizRef.id, ...quizData, timeLimit: "5 mins", color: "bg-indigo-600" });
      setIsOpen(false);
      reset();
    } catch (err: any) {
      console.error("Error generating quiz:", err);
      setError("Failed to generate quiz. Please try again.");
      setStep("topic");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "form":
        return (
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <GraduationCap size={14} /> Select Your Class
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {forms.map((f) => (
                <button
                  key={f}
                  onClick={() => { setSelectedForm(f); setStep("subject"); }}
                  className="p-3 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-bold text-slate-700 text-center text-sm"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        );
      case "subject":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} /> Select Subject
              </h4>
              <button onClick={() => setStep("form")} className="text-[9px] font-bold text-indigo-600 uppercase">Change Class</button>
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-[250px] overflow-y-auto pr-1.5 custom-scrollbar">
              {CURRICULUM.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSubject(s); setStep("topic"); }}
                  className="p-3 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-bold text-slate-700 text-left flex items-center justify-between group text-sm"
                >
                  {s.name}
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                </button>
              ))}
            </div>
          </div>
        );
      case "topic":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} /> Select Topic
              </h4>
              <button onClick={() => setStep("subject")} className="text-[9px] font-bold text-indigo-600 uppercase">Change Subject</button>
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-[250px] overflow-y-auto pr-1.5 custom-scrollbar">
              {selectedSubject?.topics[selectedForm]?.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t)}
                  className={`p-3 rounded-xl border transition-all font-bold text-left flex items-center justify-between group text-sm ${
                    selectedTopic?.id === t.id 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900' 
                      : 'border-slate-100 text-slate-700 hover:border-indigo-200'
                  }`}
                >
                  {t.name}
                  {selectedTopic?.id === t.id && <Sparkles size={14} className="text-indigo-500" />}
                </button>
              ))}
            </div>
            <button 
              onClick={generateQuiz}
              disabled={!selectedTopic || loading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95 mt-2"
            >
              <PlayCircle size={18} />
              Generate & Start Quiz
            </button>
          </div>
        );
      case "generating":
        return (
          <div className="text-center py-8 space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-2 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={24} className="text-indigo-600 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Generating Your Quiz</h3>
              <p className="text-slate-400 text-xs font-medium">
                Creating questions for <span className="text-indigo-600 font-bold">{selectedTopic?.name}</span>...
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 text-[9px] font-bold uppercase tracking-widest animate-bounce inline-block">
              Analyzing MANEB Standards
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div 
        onClick={() => { setIsOpen(true); reset(); }}
        className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-600/20 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Sparkles size={100} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">New</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Powered</span>
            </div>
            <h3 className="text-2xl font-heading font-black tracking-tight">Generate Custom Quizzes</h3>
            <p className="text-indigo-100 text-sm font-medium max-w-[200px]">Test your knowledge on any topic instantly.</p>
          </div>
          <div className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:translate-x-2 transition-transform">
            <ChevronRight size={24} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl overflow-hidden"
            >
              {step !== "generating" && (
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
                  <X size={20} />
                </button>
              )}

              <div className="text-center space-y-2 mb-8">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-heading font-black text-slate-900 tracking-tight">AI Quiz Engine</h3>
                <p className="text-slate-500 text-sm font-medium">Personalized for Malawi Secondary Curriculum</p>
              </div>

              {renderStep()}

              {error && (
                <div className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-medium flex items-start gap-3">
                  <div className="p-1 bg-white rounded-lg shrink-0"><X size={14} /></div>
                  {error}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
