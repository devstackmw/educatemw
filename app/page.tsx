"use client";
import { useState, useEffect } from "react";
import { Home, BookOpen, MessageSquare, User, Play, ChevronLeft, Sparkles, Menu } from "lucide-react";
import HomeView from "@/components/HomeView";
import PapersView from "@/components/PapersView";
import QuizzesView from "@/components/QuizzesView";
import PremiumView from "@/components/PremiumView";
import AuthView from "@/components/AuthView";
import ProfileView from "@/components/ProfileView";
import AskTeacherAI from "@/components/AskTeacherAI";
import FlashcardView from "@/components/FlashcardView";
import LeaderboardView from "@/components/LeaderboardView";
import ExamDatesView from "@/components/ExamDatesView";
import CommunityView from "@/components/CommunityView";
import SettingsView from "@/components/SettingsView";
import StudyPlanView from "@/components/StudyPlanView";
import ResourcesView from "@/components/ResourcesView";
import Sidebar from "@/components/Sidebar";
import LoadingScreen from "@/components/LoadingScreen";
import { AnimatePresence, motion } from "motion/react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, User as FirebaseUser, isSignInWithEmailLink } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState("auth");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Automatically switch to home if user is logged in and currently on auth tab
        setActiveTab((prev) => prev === "auth" ? "home" : prev);

        // Test connection to Firestore as recommended
        try {
          const { getDocFromServer } = await import("firebase/firestore");
          await getDocFromServer(doc(db, "users", currentUser.uid));
        } catch (error) {
          if (error instanceof Error && error.message.includes("offline")) {
            console.error("Firestore connection failed: client is offline.");
          }
        }

        // Check if user document exists, if not create it
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName || "Student",
            email: currentUser.email || "",
            phoneNumber: currentUser.phoneNumber || "",
            photoURL: currentUser.photoURL || "",
            isPremium: false,
            createdAt: new Date().toISOString()
          });
        }
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (!hasMounted || loading) {
    return <LoadingScreen message="Loading Educate MW..." />;
  }

  const renderView = () => {
    switch (activeTab) {
      case "home": return <HomeView onNavigate={setActiveTab} user={user} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case "papers": return <PapersView />;
      case "quizzes": return <QuizzesView />;
      case "profile": return <ProfileView user={user} />;
      case "premium": return <PremiumView />;
      case "flashcards": return <FlashcardView />;
      case "leaderboard": return <LeaderboardView />;
      case "exams": return <ExamDatesView />;
      case "community": return <CommunityView />;
      case "study_plan": return <StudyPlanView />;
      case "resources": return <ResourcesView />;
      case "settings": return <SettingsView onNavigate={setActiveTab} />;
      case "auth": return <AuthView onLogin={() => setActiveTab("home")} />;
      case "ai": return <AskTeacherAI />;
      default: return <HomeView onNavigate={setActiveTab} user={user} onOpenSidebar={() => setIsSidebarOpen(true)} />;
    }
  };

  const isMainTab = ["home", "papers", "ai", "video_list", "profile"].includes(activeTab);

  return (
    <div className="mx-auto max-w-md h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-200">
      {/* Top Header */}
      {activeTab !== 'auth' && (
        <header className="absolute top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 flex items-center gap-4">
          {activeTab === 'home' ? (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
            >
              <Menu size={20} />
            </button>
          ) : (
            <button 
              onClick={() => setActiveTab("home")}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h1 className="font-black text-slate-800 capitalize">
            {activeTab === 'home' ? 'Edumw' : activeTab.replace('_', ' ')}
          </h1>
        </header>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        onNavigate={setActiveTab} 
        user={user} 
      />

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto relative ${activeTab !== 'auth' && activeTab !== 'home' ? 'pt-16' : ''} ${isMainTab ? 'pb-24' : ''}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* TikTok Style Bottom Navigation */}
      {activeTab !== 'auth' && isMainTab && (
        <nav className="absolute bottom-0 left-0 right-0 z-50 bg-slate-900 text-white flex justify-around items-center py-2 px-2 pb-6 border-t border-white/5">
          <NavItem icon={<Home size={22} />} label="Home" isActive={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <NavItem icon={<BookOpen size={22} />} label="Library" isActive={activeTab === "papers"} onClick={() => setActiveTab("papers")} />
          
          {/* Prominent Cleo AI Button */}
          <div className="relative -top-4">
            <button 
              onClick={() => setActiveTab("ai")}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                activeTab === "ai" 
                ? "bg-blue-600 scale-110 rotate-0" 
                : "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:scale-105"
              }`}
            >
              <Sparkles size={28} className="text-white" />
              <div className="absolute -inset-1 bg-blue-400/20 rounded-2xl blur-md animate-pulse"></div>
            </button>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-blue-400">Cleo</span>
          </div>

          <NavItem icon={<Play size={22} />} label="Videos" isActive={activeTab === "video_list"} onClick={() => setActiveTab("video_list")} />
          <NavItem icon={<User size={22} />} label="Me" isActive={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
        </nav>
      )}
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
      <div className="mb-1">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
      {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-blue-500 rounded-full mt-1" />}
    </button>
  );
}
