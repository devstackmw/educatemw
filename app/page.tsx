"use client";
import { useState, useEffect } from "react";
import { Home, BookOpen, MessageSquare, User, Play, ChevronLeft, Sparkles, Menu, Trophy, AlertCircle, ShieldAlert, Flame, X } from "lucide-react";
import dynamic from "next/dynamic";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, collection, onSnapshot, updateDoc, increment, query, where, getDocs, writeBatch } from "firebase/firestore";
import { AnimatePresence, motion } from "motion/react";
import { memo, useMemo } from "react";

// Dynamic imports for performance optimization
const HomeView = dynamic(() => import("@/components/HomeView"), { loading: () => <LoadingScreen message="Loading Home..." /> });
const PapersView = dynamic(() => import("@/components/PapersView"), { loading: () => <LoadingScreen message="Loading Papers..." /> });
const QuizzesView = dynamic(() => import("@/components/QuizzesView"), { loading: () => <LoadingScreen message="Loading Quizzes..." /> });
const PremiumView = dynamic(() => import("@/components/PremiumView"), { loading: () => <LoadingScreen message="Loading Premium..." /> });
const AuthView = dynamic(() => import("@/components/AuthView"), { loading: () => <LoadingScreen message="Loading Auth..." /> });
const ProfileView = dynamic(() => import("@/components/ProfileView"), { loading: () => <LoadingScreen message="Loading Profile..." /> });
const AskTeacherAI = dynamic(() => import("@/components/AskTeacherAI"), { loading: () => <LoadingScreen message="Loading AI Teacher..." /> });
const FlashcardView = dynamic(() => import("@/components/FlashcardView"), { loading: () => <LoadingScreen message="Loading Flashcards..." /> });
const LeaderboardView = dynamic(() => import("@/components/LeaderboardView"), { loading: () => <LoadingScreen message="Loading Leaderboard..." /> });
const ExamDatesView = dynamic(() => import("@/components/ExamDatesView"), { loading: () => <LoadingScreen message="Loading Exams..." /> });
const CommunityView = dynamic(() => import("@/components/CommunityView"), { loading: () => <LoadingScreen message="Loading Community..." /> });
const PremiumStudentsView = dynamic(() => import("@/components/PremiumStudentsView"), { loading: () => <LoadingScreen message="Loading Students..." /> });
const TimetableView = dynamic(() => import("@/components/TimetableView"), { loading: () => <LoadingScreen message="Loading Timetable..." /> });
const SettingsView = dynamic(() => import("@/components/SettingsView"), { loading: () => <LoadingScreen message="Loading Settings..." /> });
const StudyPlanView = dynamic(() => import("@/components/StudyPlanView"), { loading: () => <LoadingScreen message="Loading Study Plan..." /> });
const ResourcesView = dynamic(() => import("@/components/ResourcesView"), { loading: () => <LoadingScreen message="Loading Resources..." /> });
const StudyHubView = dynamic(() => import("@/components/StudyHubView"), { loading: () => <LoadingScreen message="Loading Study Hub..." /> });
const VideosView = dynamic(() => import("@/components/VideosView"), { loading: () => <LoadingScreen message="Loading Videos..." /> });
const PrivacyPolicyView = dynamic(() => import("@/components/PrivacyPolicyView"), { loading: () => <LoadingScreen message="Loading Privacy..." /> });
const TermsOfServiceView = dynamic(() => import("@/components/TermsOfServiceView"), { loading: () => <LoadingScreen message="Loading Terms..." /> });
const LandingView = dynamic(() => import("@/components/LandingView"), { loading: () => <LoadingScreen message="Loading..." /> });
const OnboardingView = dynamic(() => import("@/components/OnboardingView"), { loading: () => <LoadingScreen message="Loading Onboarding..." /> });

// Static components
import Sidebar from "@/components/Sidebar";
import LoadingScreen from "@/components/LoadingScreen";
import InstallPWA from "@/components/InstallPWA";

const NavItem = memo(({ icon, label, isActive, onClick }: any) => {
  return (
    <button onClick={onClick} className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
      <div className="mb-0.5">
        {icon}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-tight">{label}</span>
      {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-blue-500 rounded-full mt-0.5" />}
    </button>
  );
});

NavItem.displayName = "NavItem";

export default function App() {
  const [activeTab, setActiveTab] = useState("landing");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showMenuHint, setShowMenuHint] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'home') {
      const hasSeenHint = window.localStorage.getItem('hasSeenMenuHint');
      if (!hasSeenHint) {
        const timer1 = setTimeout(() => setShowMenuHint(true), 2000);
        const timer2 = setTimeout(() => setShowMenuHint(false), 5000);
        const timer3 = setTimeout(() => setShowMenuHint(true), 8000);
        const timer4 = setTimeout(() => {
          setShowMenuHint(false);
          window.localStorage.setItem('hasSeenMenuHint', 'true');
        }, 11000);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
          clearTimeout(timer4);
        };
      }
    }
  }, [user, activeTab]);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "app"), (docSnap) => {
      if (docSnap.exists()) {
        setMaintenanceMode(docSnap.data().maintenanceMode || false);
      }
    });
    return () => unsubSettings();
  }, []);

  useEffect(() => {
    // Promotion timer for free users
    if (userData && !userData.isPremium && activeTab !== 'landing' && activeTab !== 'auth') {
      const timer = setTimeout(() => {
        const hasSeenPromo = window.sessionStorage.getItem('hasSeenPromo');
        if (!hasSeenPromo) {
          setShowPromoModal(true);
          window.sessionStorage.setItem('hasSeenPromo', 'true');
        }
      }, 90000); // 1.5 minutes
      return () => clearTimeout(timer);
    }
  }, [userData, activeTab]);

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
    const paymentStatus = urlParams.get('payment');
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      window.localStorage.setItem('referralCodeFromUrl', refCode);
    }

    if (paymentStatus === 'success') {
      // We don't show the modal immediately, we wait for the real-time listener to confirm premium
      setIsVerifyingPayment(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed') {
      setShowPaymentError(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
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
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    
    // Listen for real-time updates to user data (important for premium status)
    const unsubUser = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Sync premium status to userStats
        const statsRef = doc(db, "userStats", user.uid);
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
          const statsData = statsSnap.data();
          if (statsData.isPremium !== data.isPremium || statsData.isBanned !== data.isBanned || statsData.displayName !== (data.nickname || data.displayName)) {
            await updateDoc(statsRef, {
              isPremium: data.isPremium,
              isBanned: data.isBanned || false,
              displayName: data.nickname || data.displayName || "Student"
            });
          }
        }

        // Handle banned users
        if (data.isBanned) {
          setLoading(false);
          setUserData(data);
          return;
        }

        // If user just became premium in this session, show the success modal
        // We use a functional update or check against the current state
        setUserData((prev: any) => {
          if (data.isPremium && prev && !prev.isPremium) {
            setShowPaymentSuccess(true);
            setShowPaymentError(false); // Fix: Hide error if success detected
            setIsVerifyingPayment(false);
          } else if (data.isPremium && isVerifyingPayment) {
            setShowPaymentSuccess(true);
            setShowPaymentError(false); // Fix: Hide error if success detected
            setIsVerifyingPayment(false);
          }
          return data;
        });
      } else {
        // Create initial user doc if it doesn't exist
        const createNewUser = async () => {
          const newUserRef = doc(db, "users", user.uid);
          const referralCodeFromUrl = window.localStorage.getItem('referralCodeFromUrl');
          let initialAiPoints = 5;
          let referrerUid = null;
          let referrerData = null;

          if (referralCodeFromUrl) {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("referralCode", "==", referralCodeFromUrl.toUpperCase()));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const referrerDoc = querySnapshot.docs[0];
              referrerUid = referrerDoc.id;
              referrerData = referrerDoc.data();
              initialAiPoints += 5; // Bonus for being referred
            }
          }

          const batch = writeBatch(db);
          
          // 1. Create main user doc
          batch.set(newUserRef, {
            uid: user.uid,
            displayName: user.displayName || "Student",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            photoURL: user.photoURL || "",
            isPremium: false,
            hasCompletedOnboarding: false,
            createdAt: new Date().toISOString(),
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            aiPoints: initialAiPoints
          });

          // 2. Create public profile
          batch.set(doc(db, "publicProfiles", user.uid), {
            uid: user.uid,
            displayName: user.displayName || "Student",
            photoURL: user.photoURL || "",
            isPremium: false
          });

          // 3. Create initial stats
          batch.set(doc(db, "userStats", user.uid), {
            uid: user.uid,
            displayName: user.displayName || "Student",
            points: referrerUid ? 10 : 0, // 10 points if referred, 0 otherwise
            streak: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            isPremium: false,
            isBanned: false
          });

          // 4. Handle referral rewards for referrer if applicable
          if (referrerUid && referrerData) {
            // Create referral record
            const referralRef = doc(collection(db, "referrals"));
            batch.set(referralRef, {
              referrerUid: referrerUid,
              referredUid: user.uid,
              referrerName: referrerData.displayName,
              referredName: user.displayName || "Student",
              createdAt: new Date().toISOString(),
              automatic: true
            });

            // Reward referrer (5 AI points)
            const referrerRef = doc(db, "users", referrerUid);
            batch.update(referrerRef, {
              aiPoints: increment(5)
            });

            // Update stats for referrer (10 points)
            const referrerStatsRef = doc(db, "userStats", referrerUid);
            batch.update(referrerStatsRef, {
              points: increment(10)
            });

            // Clear the referral code from storage
            window.localStorage.removeItem('referralCodeFromUrl');
          }

          await batch.commit();
        };

        createNewUser();
      }
      setLoading(false);
    }, (error) => {
      console.error("User data snapshot error:", error);
      setLoading(false);
    });

    return () => unsubUser();
  }, [user, isVerifyingPayment]);

  useEffect(() => {
    if (!user) return;

    // Handle Streak Logic and Stats
    const statsRef = doc(db, "userStats", user.uid);
    let streakHandled = false;

    const unsubStats = onSnapshot(statsRef, async (statsSnap) => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (statsSnap.exists()) {
        const data = statsSnap.data();
        setUserStats(data);
        
        // Only run streak logic once per session or when day changes
        if (streakHandled) return;

        const lastActive = data.lastActiveDate;
        let newStreak = data.streak || 0;
        let shouldUpdate = false;

        if (lastActive === yesterdayStr) {
          newStreak += 1;
          shouldUpdate = true;
          setStreakCount(newStreak);
          setShowStreakModal(true);
          streakHandled = true;
        } else if (lastActive !== todayStr) {
          newStreak = 1;
          shouldUpdate = true;
          setStreakCount(newStreak);
          setShowStreakModal(true);
          streakHandled = true;
        } else {
          // Already active today
          setStreakCount(newStreak);
          streakHandled = true;
        }

        if (shouldUpdate) {
          const { updateDoc } = await import("firebase/firestore");
          await updateDoc(statsRef, {
            streak: newStreak,
            lastActiveDate: todayStr,
            isPremium: userData?.isPremium || false // Sync on update too
          });
        }
      }
    });

    // Test connection to Firestore
    const testConnection = async () => {
      try {
        const { getDocFromServer } = await import("firebase/firestore");
        const userRef = doc(db, "users", user.uid);
        await getDocFromServer(userRef);
      } catch (error) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.error("Firestore connection failed: client is offline.");
        }
      }
    };
    testConnection();

    return () => unsubStats();
  }, [user, userData?.isPremium, userData?.isBanned, userData?.nickname, userData?.displayName]);

  useEffect(() => {
    // Listen for latest active announcement
    const q = collection(db, "announcements");
    const unsubAnn = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(d => d.active)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (docs.length > 0) {
        setAnnouncement(docs[0]);
        setShowAnnouncement(true);
      } else {
        setAnnouncement(null);
      }
    });

    return () => unsubAnn();
  }, []);

  // Memoize views to prevent unnecessary re-renders
  const views = useMemo(() => ({
    home: <HomeView onNavigate={navigateTo} user={user} isPremium={userData?.isPremium} onOpenSidebar={() => setIsSidebarOpen(true)} />,
    papers: <PapersView isPremium={userData?.isPremium} onNavigate={navigateTo} />,
    quizzes: <QuizzesView isPremium={userData?.isPremium} />,
    videos: <VideosView isPremium={userData?.isPremium} />,
    study_hub: <StudyHubView isPremium={userData?.isPremium} onNavigate={navigateTo} />,
    profile: <ProfileView user={user} isPremium={userData?.isPremium} />,
    premium: <PremiumView user={user} isPremium={userData?.isPremium} />,
    flashcards: <FlashcardView isPremium={userData?.isPremium} />,
    leaderboard: <LeaderboardView currentUserStats={userStats} />,
    exams: <ExamDatesView />,
    community: <CommunityView isPremium={userData?.isPremium} onNavigate={navigateTo} />,
    premium_students: <PremiumStudentsView />,
    timetable: <TimetableView onClose={() => navigateTo("home")} />,
    study_plan: <StudyPlanView />,
    resources: <ResourcesView />,
    settings: <SettingsView onNavigate={navigateTo} />,
    privacy: <PrivacyPolicyView onBack={() => navigateTo(user ? "settings" : "landing")} />,
    terms: <TermsOfServiceView onBack={() => navigateTo(user ? "settings" : "landing")} />,
    auth: <AuthView onLogin={() => navigateTo("home")} />,
    auth_signup: <AuthView onLogin={() => navigateTo("home")} initialMode="signup" />,
    landing: <LandingView onGetStarted={() => navigateTo("auth")} onNavigate={navigateTo} />,
    ai: <AskTeacherAI isPremium={userData?.isPremium} aiPoints={userData?.aiPoints} />,
  }), [user, userData, userStats]);

  const renderView = () => {
    return (views as any)[activeTab] || views.home;
  };

  if (!hasMounted || loading) {
    return <LoadingScreen message="Loading Educate MW..." />;
  }

  if (isVerifyingPayment && !userData?.isPremium) {
    return <LoadingScreen message="Verifying your payment... Please wait." />;
  }

  if (maintenanceMode && userData?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-center">
        <div className="space-y-6 max-w-xs">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Under Maintenance</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              We are currently upgrading our systems to serve you better. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (userData?.isBanned) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-center">
        <div className="space-y-6 max-w-xs">
          <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Account Suspended</h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Your account has been suspended due to a violation of our terms of service. 
              If you believe this is a mistake, please contact support.
            </p>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const handlePWAInstall = async () => {
    if (!user || !userData) return;
    
    const isRewarded = localStorage.getItem("pwa_install_rewarded");
    if (isRewarded) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        aiPoints: increment(10)
      });
      localStorage.setItem("pwa_install_rewarded", "true");
      // Optional: Show a success toast or message
      console.log("PWA Install Reward Granted: +10 AI Points");
    } catch (error) {
      console.error("Error rewarding PWA install:", error);
    }
  };

  const isMainTab = ["home", "papers", "leaderboard", "profile", "videos"].includes(activeTab);

  if (user && userData && !userData.hasCompletedOnboarding && activeTab !== 'landing' && activeTab !== 'auth' && activeTab !== 'auth_signup') {
    return (
      <div className="mx-auto max-w-md h-[100dvh] bg-gray-50 dark:bg-slate-900 flex flex-col relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <OnboardingView user={user} onComplete={() => setUserData({...userData, hasCompletedOnboarding: true})} onNavigate={navigateTo} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md h-[100dvh] bg-gray-50 dark:bg-slate-900 flex flex-col relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-200 dark:border-slate-800 transition-colors duration-300">
      {/* Top Header */}
      {activeTab !== 'auth' && (
        <header className="absolute top-0 left-0 right-0 z-[60] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 p-3 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            {activeTab === 'home' ? (
              <div className="relative">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-700 dark:text-slate-200 flex items-center justify-center"
                >
                  <Menu size={22} />
                </button>
                <AnimatePresence>
                  {showMenuHint && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 z-[70]"
                    >
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-600 rotate-45 rounded-sm"></div>
                      Click here for new users
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab("home")}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <h1 className="font-bold text-slate-800 capitalize text-sm tracking-tight">
              {activeTab === 'home' ? 'Educate MW' : activeTab.replace('_', ' ')}
            </h1>
          </div>
          
          {userStats && (
            <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
              <Flame size={14} className="text-orange-500" fill="currentColor" />
              <span className="text-xs font-bold text-orange-600">{userStats.streak}</span>
            </div>
          )}
        </header>
      )}

      {/* Announcement Banner */}
      <AnimatePresence>
        {announcement && showAnnouncement && activeTab !== 'auth' && activeTab !== 'landing' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`z-[55] relative mt-16 mx-3 rounded-xl p-3 flex items-start gap-3 shadow-sm border ${
              announcement.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
              announcement.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              'bg-blue-50 border-blue-100 text-blue-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              <AlertCircle size={16} />
            </div>
            <div className="flex-1">
              <h4 className="text-[11px] font-black uppercase tracking-wider mb-0.5">{announcement.title}</h4>
              <p className="text-[10px] font-medium leading-relaxed opacity-90">{announcement.content}</p>
            </div>
            <button 
              onClick={() => setShowAnnouncement(false)}
              className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
      <main className={`flex-1 overflow-y-auto relative ${activeTab !== 'auth' ? 'pt-16' : ''} ${isMainTab ? 'pb-16' : ''}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
      <InstallPWA onInstall={handlePWAInstall} />

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

      {/* Payment Error Modal */}
      <AnimatePresence>
        {showPaymentError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl p-6 w-full max-w-xs text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} fill="currentColor" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Payment Failed</h3>
                <p className="text-slate-500 text-xs font-medium">
                  We couldn&apos;t verify your payment automatically.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl text-left space-y-2 border border-blue-100">
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Manual Verification</p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  If you have already paid, please capture a <strong>screenshot</strong> of your payment message and send it to us on WhatsApp for manual approval.
                </p>
                <a 
                  href={`https://wa.me/265987066051?text=${encodeURIComponent(`Hello Educate MW, I have made a payment for premium access. My username is ${userData?.nickname || userData?.displayName || user?.displayName || 'Student'}. Please verify my payment.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                >
                  <MessageSquare size={14} />
                  Send to WhatsApp
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setShowPaymentError(false);
                    navigateTo("premium");
                  }}
                  className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => setShowPaymentError(false)}
                  className="w-full bg-slate-100 text-slate-500 font-bold py-2 rounded-xl active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Streak Celebration Modal */}
      <AnimatePresence>
        {showStreakModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-xs text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-100 to-transparent"></div>
              
              <div className="relative">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-orange-500/30 border-4 border-white"
                >
                  <Flame size={48} fill="currentColor" />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1 rounded-full text-sm font-black shadow-lg border-2 border-white whitespace-nowrap"
                >
                  {streakCount} {streakCount === 1 ? 'DAY' : 'DAYS'}
                </motion.div>
              </div>

              <div className="space-y-2 pt-2 relative z-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {streakCount === 1 ? "Streak Started!" : "Streak Extended!"}
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  {streakCount === 1 
                    ? "You've taken the first step. Come back tomorrow to keep it going!" 
                    : "You're on fire! Keep up the great work and don't break the chain."}
                </p>
              </div>

              <button 
                onClick={() => setShowStreakModal(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/25 active:scale-95 transition-all text-sm relative z-10"
              >
                Continue Learning
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promotion Modal */}
      <AnimatePresence>
        {showPromoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-xs text-center space-y-5 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Sparkles size={32} fill="currentColor" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Unlock Your Potential!</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Join 1,000+ students using PRO to get better grades. Get unlimited AI help, all past papers, and expert quizzes!
                </p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowPromoModal(false);
                    navigateTo(user?.isAnonymous ? "auth_signup" : "premium");
                  }}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all text-sm"
                >
                  {user?.isAnonymous ? "Create Account & Save Progress" : "Upgrade to PRO Now"}
                </button>
                <button 
                  onClick={() => setShowPromoModal(false)}
                  className="w-full bg-slate-50 text-slate-400 font-bold py-3 rounded-xl active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
