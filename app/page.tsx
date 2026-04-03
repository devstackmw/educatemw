"use client";
import { useState, useEffect } from "react";
import { Home, BookOpen, MessageSquare, User, Play, ChevronLeft, Sparkles, Menu, Trophy } from "lucide-react";
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
import InstallPWA from "@/components/InstallPWA";
import PrivacyPolicyView from "@/components/PrivacyPolicyView";
import TermsOfServiceView from "@/components/TermsOfServiceView";
import LandingView from "@/components/LandingView";
import { AnimatePresence, motion } from "motion/react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, User as FirebaseUser, isSignInWithEmailLink } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch, onSnapshot } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState("landing");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else if (user) {
        setActiveTab("home");
      } else {
        setActiveTab("landing");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user]);

  const navigateTo = (tab: string, pushState = true) => {
    setActiveTab(tab);
    if (pushState) {
      window.history.pushState({ tab }, "", "");
    }
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      navigateTo(e.detail);
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  useEffect(() => {
    setHasMounted(true);
    
    // Check for payment success in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Handle initial URL path for Google Verification
    const path = window.location.pathname;
    if (path === '/privacy') {
      setActiveTab('privacy');
    } else if (path === '/terms') {
      setActiveTab('terms');
    } else if (path === '/home') {
      setActiveTab('landing');
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserData(null);
        // If not logged in, and not on a legal page, show landing
        setActiveTab((prev) => (prev === 'privacy' || prev === 'terms') ? prev : 'landing');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Automatically switch to home if user is logged in and currently on auth/landing tab
    if (activeTab === "auth" || activeTab === "landing") {
      navigateTo("home", false);
    }

    // Check if user document exists, if not create it
    const userRef = doc(db, "users", user.uid);
    
    // Listen for real-time updates to user data (important for premium status)
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        // Create initial user doc if it doesn't exist
        setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || "Student",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          photoURL: user.photoURL || "",
          isPremium: false,
          createdAt: new Date().toISOString()
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("User data snapshot error:", error);
      setLoading(false);
    });

    // Test connection to Firestore as recommended
    const testConnection = async () => {
      try {
        const { getDocFromServer } = await import("firebase/firestore");
        await getDocFromServer(userRef);
      } catch (error) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.error("Firestore connection failed: client is offline.");
        }
      }
    };
    testConnection();

    return () => unsubUser();
  }, [user, activeTab]);

  if (!hasMounted || loading) {
    return <LoadingScreen message="Loading Educate MW..." />;
  }

  const renderView = () => {
    switch (activeTab) {
      case "home": return <HomeView onNavigate={navigateTo} user={user} isPremium={userData?.isPremium} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case "papers": return <PapersView isPremium={userData?.isPremium} onNavigate={navigateTo} />;
      case "quizzes": return <QuizzesView />;
      case "profile": return <ProfileView user={user} isPremium={userData?.isPremium} />;
      case "premium": return <PremiumView user={user} isPremium={userData?.isPremium} />;
      case "flashcards": return <FlashcardView />;
      case "leaderboard": return <LeaderboardView />;
      case "exams": return <ExamDatesView />;
      case "community": return <CommunityView isPremium={userData?.isPremium} onNavigate={navigateTo} />;
      case "study_plan": return <StudyPlanView />;
      case "resources": return <ResourcesView />;
      case "settings": return <SettingsView onNavigate={navigateTo} />;
      case "privacy": return <PrivacyPolicyView onBack={() => navigateTo(user ? "settings" : "landing")} />;
      case "terms": return <TermsOfServiceView onBack={() => navigateTo(user ? "settings" : "landing")} />;
      case "auth": return <AuthView onLogin={() => navigateTo("home")} />;
      case "landing": return <LandingView onGetStarted={() => navigateTo("auth")} onNavigate={navigateTo} />;
      case "ai": return <AskTeacherAI isPremium={userData?.isPremium} />;
      default: return <HomeView onNavigate={navigateTo} user={user} onOpenSidebar={() => setIsSidebarOpen(true)} />;
    }
  };

  const isMainTab = ["home", "papers", "leaderboard", "profile"].includes(activeTab);

  return (
    <div className="mx-auto max-w-md h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-200">
      {/* Top Header */}
      {activeTab !== 'auth' && (
        <header className="absolute top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-100 p-3 flex items-center gap-3">
          {activeTab === 'home' ? (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <Menu size={18} />
            </button>
          ) : (
            <button 
              onClick={() => setActiveTab("home")}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <h1 className="font-bold text-slate-800 capitalize text-sm tracking-tight">
            {activeTab === 'home' ? 'Educate MW' : activeTab.replace('_', ' ')}
          </h1>
        </header>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        onNavigate={navigateTo} 
        user={user} 
        userData={userData}
        isPremium={userData?.isPremium}
      />

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto relative ${activeTab !== 'auth' && activeTab !== 'home' ? 'pt-16' : ''} ${isMainTab ? 'pb-16' : ''}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* TikTok Style Bottom Navigation */}
      {activeTab !== 'auth' && isMainTab && (
        <nav className="absolute bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl text-white flex justify-around items-center py-2 px-4 border-t border-white/10 shadow-xl w-full">
          <NavItem icon={<Home size={18} />} label="Home" isActive={activeTab === "home"} onClick={() => navigateTo("home")} />
          <NavItem icon={<BookOpen size={18} />} label="Library" isActive={activeTab === "papers"} onClick={() => navigateTo("papers")} />
          
          {/* Prominent Cleo AI Button */}
          <div className="relative">
            <button 
              onClick={() => navigateTo("ai")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                activeTab === "ai" 
                ? "bg-blue-600 scale-105" 
                : "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:scale-105"
              }`}
            >
              <Sparkles size={20} className="text-white" />
            </button>
          </div>

          <NavItem icon={<Trophy size={18} />} label="Rank" isActive={activeTab === "leaderboard"} onClick={() => navigateTo("leaderboard")} />
          <NavItem icon={<User size={18} />} label="Me" isActive={activeTab === "profile"} onClick={() => navigateTo("profile")} />
        </nav>
      )}

      {/* PWA Install Prompt */}
      <InstallPWA />

      {/* Payment Success Modal */}
      <AnimatePresence>
        {showPaymentSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl p-6 w-full max-w-xs text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Trophy size={32} fill="currentColor" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
                <p className="text-slate-500 text-xs font-medium">
                  Welcome to Educate MW PRO! Your premium features are now unlocked.
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowPaymentSuccess(false);
                  navigateTo("home");
                }}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm"
              >
                Start Learning
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
      <div className="mb-0.5">
        {icon}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-tight">{label}</span>
      {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-blue-500 rounded-full mt-0.5" />}
    </button>
  );
}
