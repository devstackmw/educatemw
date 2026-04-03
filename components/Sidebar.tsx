"use client";
import { 
  X, Home, BookOpen, MessageSquare, User, 
  Trophy, Calendar, Settings, Zap, LogOut, 
  HelpCircle, Layers, PlayCircle, Users,
  Clock, Archive, Star
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";

import { AppIcon } from "./AppLogo";

import { AVATARS } from "@/lib/avatars";
import Image from "next/image";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  user: any;
  userData?: any;
  isPremium?: boolean;
}

export default function Sidebar({ isOpen, onClose, activeTab, onNavigate, user, userData, isPremium }: SidebarProps) {
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
    { id: "premium_students", label: "Premium Students", icon: <Star size={20} className="text-amber-500" /> },
    { id: "timetable", label: "Student Timetable", icon: <Calendar size={20} /> },
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
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AppIcon size={32} className="shadow-md shadow-blue-600/20" />
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">Educate MW</span>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                <X size={18} />
              </button>
            </div>

            {/* User Profile Summary */}
            <div className="p-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden relative">
                  {userData?.photoURL ? (
                    <Image 
                      src={userData.photoURL} 
                      alt="" 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full p-2">
                      {AVATARS.find(a => a.id === userData?.avatarId)?.svg || <User size={20} />}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-800 truncate text-sm">{userData?.nickname || userData?.realName || user?.displayName || "Student"}</h3>
                    {isPremium && (
                      <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-sm shadow-orange-500/20">PRO</span>
                    )}
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{isPremium ? "Pro Account" : "Free Account"}</p>
                </div>
              </div>
              {!isPremium && (
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
                    onClose();
                  }}
                  className="mt-3 w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 active:scale-95 transition-all"
                >
                  <Zap size={12} fill="currentColor" />
                  Upgrade to Pro
                </button>
              )}
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    activeTab === item.id 
                    ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className={activeTab === item.id ? "text-blue-600" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span className="font-bold text-xs">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 space-y-0.5">
              <button 
                onClick={() => { onNavigate("settings"); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
              >
                <Settings size={18} className="text-slate-400" />
                <span className="font-bold text-xs">Settings</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={18} />
                <span className="font-bold text-xs">Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
