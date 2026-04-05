"use client";
import { Clock, CheckCircle2, Circle, Plus, ChevronRight, Trash2, Sparkles, Loader2, X, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { StudyPlanSkeleton } from "./Skeleton";
import { useStudyPlan, StudyTask } from "@/hooks/useStudyPlan";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function StudyPlanView() {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useStudyPlan();
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTask, setNewTask] = useState({ task: "", time: "08:00", subject: "" });
  const [error, setError] = useState("");

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.task || !newTask.subject) return;
    
    try {
      await addTask(newTask.task, newTask.time, newTask.subject);
      setNewTask({ task: "", time: "08:00", subject: "" });
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const generateAIPlan = async () => {
    if (!auth.currentUser) return;
    setIsGenerating(true);
    setError("");

    try {
      // Get user's grade and subjects from profile
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.data();
      const grade = userData?.grade || "MSCE Student";
      const subjects = userData?.subjects && userData.subjects.length > 0 
        ? userData.subjects 
        : ["English", "Mathematics", "Biology", "Physical Science", "Geography", "History", "Chichewa", "Agriculture"];

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a professional daily study plan for a ${grade} in Malawi studying these subjects: ${subjects.join(", ")}. 
        Return a JSON array of objects with these properties: task (string), time (string, format HH:MM), subject (string).
        Create exactly 6 tasks for a balanced day.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                time: { type: Type.STRING },
                subject: { type: Type.STRING }
              },
              required: ["task", "time", "subject"]
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("No response from AI");
      }

      const generatedTasks = JSON.parse(response.text);
      
      // Add each task to Firestore
      for (const t of generatedTasks) {
        await addTask(t.task, t.time, t.subject);
      }
    } catch (err: any) {
      console.error("AI Generation error:", err);
      setError("Failed to generate study plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <StudyPlanSkeleton />;

  return (
    <div className="p-4 pt-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm shadow-indigo-100/50">
            <Clock size={24} />
          </div>
          <div>
            <h2 className="font-black text-xl text-slate-900 tracking-tight">Study Plan</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Daily Schedule</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-700"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Progress Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full opacity-50"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm tracking-tight">Today&apos;s Progress</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {completedCount} of {tasks.length} tasks completed
              </p>
            </div>
            <span className="text-indigo-600 font-black text-lg tracking-tighter">{progress}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full w-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full shadow-lg"
            ></motion.div>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em]">Timeline</h3>
          {tasks.length > 0 && (
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-MW', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <Calendar size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-slate-900 font-black text-sm">Your schedule is empty</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest max-w-[180px] mx-auto">Add tasks manually or let AI build your perfect plan!</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {tasks.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-4 group"
                >
                  <div className="flex flex-col items-center pt-1">
                    <button 
                      onClick={() => toggleTask(item.id, item.completed)}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm ${item.completed ? "bg-emerald-100 text-emerald-600 shadow-emerald-100/50" : "bg-white border-2 border-slate-100 text-slate-300 hover:border-indigo-200"}`}
                    >
                      {item.completed ? <CheckCircle2 size={20} strokeWidth={3} /> : <Circle size={20} strokeWidth={2} />}
                    </button>
                    {idx !== tasks.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-2 rounded-full"></div>}
                  </div>
                  
                  <div className={`flex-1 p-5 rounded-[1.5rem] border-2 transition-all relative group ${item.completed ? "bg-slate-50/50 border-transparent opacity-60" : "bg-white border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5"}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.time}</span>
                      <button 
                        onClick={() => deleteTask(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h4 className={`font-black text-slate-900 text-sm tracking-tight ${item.completed ? "line-through" : ""}`}>{item.task}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-md">
                        {item.subject}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Generate Button */}
      <div className="space-y-3 pt-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-bold flex items-center gap-2">
            <X size={14} />
            {error}
          </div>
        )}
        <button 
          onClick={generateAIPlan}
          disabled={isGenerating}
          className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group overflow-hidden relative"
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Sparkles size={18} className="text-amber-400 group-hover:rotate-12 transition-transform" />
              Generate AI Study Plan
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>
        <p className="text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">Powered by Gemini AI</p>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Add New Task</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Review Calculus" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={newTask.task}
                    onChange={e => setNewTask({...newTask, task: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                    <input 
                      type="time" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={newTask.time}
                      onChange={e => setNewTask({...newTask, time: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Math" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={newTask.subject}
                      onChange={e => setNewTask({...newTask, subject: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Save Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
