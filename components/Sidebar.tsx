"use client";
import { 
  X, Home, BookOpen, MessageSquare, User, 
  Trophy, Calendar, Settings, Zap, LogOut, 
  HelpCircle, Layers, PlayCircle, Users,
  Clock, Archive
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  user: any;
}

export default function Sidebar({ isOpen, onClose, activeTab, onNavigate, user }: SidebarProps) {
  const handleLogout = async () => {
    await signOut(auth);
    onNavigate("auth");
    onClose();
  };

  const menuItems = [
    { id: "home", label: "Dashboard", icon: <Home size={20} /> },
    { id: "papers", label: "Past Papers", icon: <BookOpen size={20} /> },
    { id: "quizzes", label: "Quizzes", icon: <HelpCircle size={20} /> },
    { id: "flashcards", label: "Flashcards", icon: <Layers size={20} /> },
    { id: "study_plan", label: "Study Plan", icon: <Clock size={20} /> },
    { id: "resources", label: "Resources", icon: <Archive size={20} /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy size={20} /> },
    { id: "exams", label: "Exam Countdown", icon: <Calendar size={20} /> },
    { id: "community", label: "Community", icon: <Users size={20} /> },
    { id: "ai", label: "Cleo AI Assistant", icon: <MessageSquare size={20} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar Content */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">E</div>
                <span className="font-black text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Edumw</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            {/* User Profile Summary */}
            <div className="p-6 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <User size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 truncate">{user?.displayName || "Student"}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Free Account</p>
                </div>
              </div>
              <button 
                onClick={() => { onNavigate("premium"); onClose(); }}
                className="mt-4 w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
              >
                <Zap size={14} fill="currentColor" />
                Upgrade to Pro
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                    activeTab === item.id 
                    ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className={activeTab === item.id ? "text-blue-600" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span className="font-bold text-sm">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 space-y-1">
              <button 
                onClick={() => { onNavigate("settings"); onClose(); }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                <Settings size={20} className="text-slate-400" />
                <span className="font-bold text-sm">Settings</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} />
                <span className="font-bold text-sm">Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
