"use client";
import { useState, useEffect } from "react";
import { Home, BookOpen, MessageSquare, User, Play } from "lucide-react";
import HomeView from "@/components/HomeView";
import PapersView from "@/components/PapersView";
import QuizzesView from "@/components/QuizzesView";
import PremiumView from "@/components/PremiumView";
import AuthView from "@/components/AuthView";
import ProfileView from "@/components/ProfileView";
import AskTeacherAI from "@/components/AskTeacherAI";
import LoadingScreen from "@/components/LoadingScreen";
import { AnimatePresence, motion } from "motion/react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, User as FirebaseUser, isSignInWithEmailLink } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState("auth");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
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

  if (loading) {
    return <LoadingScreen message="Loading Educate MW..." />;
  }

  const renderView = () => {
    switch (activeTab) {
      case "home": return <HomeView onNavigate={setActiveTab} user={user} />;
      case "papers": return <PapersView />;
      case "quizzes": return <QuizzesView />;
      case "profile": return <ProfileView user={user} />;
      case "premium": return <PremiumView />;
      case "auth": return <AuthView onLogin={() => setActiveTab("home")} />;
      case "ai": return <AskTeacherAI />;
      default: return <HomeView onNavigate={setActiveTab} user={user} />;
    }
  };

  return (
    <div className="mx-auto max-w-md h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-200">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {activeTab !== 'auth' && (
        <nav className="absolute bottom-6 left-4 right-4 z-50 bg-white/80 backdrop-blur-xl border border-white/40 flex justify-around items-center py-4 px-2 rounded-3xl shadow-2xl">
          <NavItem icon={<Home size={22} />} label="Home" isActive={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <NavItem icon={<Play size={22} />} label="Videos" isActive={activeTab === "video_list"} onClick={() => setActiveTab("video_list")} />
          <NavItem icon={<BookOpen size={22} />} label="Library" isActive={activeTab === "papers"} onClick={() => setActiveTab("papers")} />
          <NavItem icon={<MessageSquare size={22} />} label="Ed-Ai" isActive={activeTab === "ai"} onClick={() => setActiveTab("ai")} />
          <NavItem icon={<User size={22} />} label="Me" isActive={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
        </nav>
      )}
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
      <div className={`${isActive ? 'bg-blue-50 p-2 rounded-xl' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] mt-1 font-bold ${isActive ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  );
}
