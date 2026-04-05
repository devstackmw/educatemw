import { useState, useEffect, memo, useMemo } from "react";
import { AppIcon } from "./AppLogo";
import { BookOpen, HelpCircle, User, ChevronRight, Layers, Zap, Trophy, Clock, Sparkles, FileText, Bell, Calendar, PlayCircle } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, collection, query, where, getCountFromServer, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase";
import { AVATARS } from "@/lib/avatars";
import { motion } from "motion/react";
import { HomeSkeleton } from "./Skeleton";
import Image from "next/image";

// Memoized components for performance
const BentoCard = memo(({ icon, label, sub, color, onClickTab, className = "", horizontal = false }: any) => (
  <div 
    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: onClickTab }))} 
    className={`${color} ${className} p-5 rounded-3xl border cursor-pointer transition-all hover:shadow-md active:scale-[0.98] group flex ${horizontal ? 'flex-row items-center gap-4' : 'flex-col items-start'}`}
  >
    <div className={`p-3 bg-white rounded-2xl shadow-sm mb-3 transition-transform group-hover:scale-110 ${horizontal ? 'mb-0' : ''}`}>
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-slate-900 text-sm leading-tight">{label}</h4>
      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1">{sub}</p>
    </div>
  </div>
));

BentoCard.displayName = "BentoCard";

export default function HomeView({ onNavigate, user, isPremium, onOpenSidebar }: { onNavigate: (tab: string) => void, user?: FirebaseUser | null, isPremium?: boolean, onOpenSidebar: () => void }) {
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [rank, setRank] = useState<number | string>("--");
  const [avatarId, setAvatarId] = useState<string>("girl_1");
  const [photoURL, setPhotoURL] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState<{completed: boolean, date: string} | null>(null);
  const [dailyTip, setDailyTip] = useState("Consistency is key to mastering complex subjects.");
  const [showTipModal, setShowTipModal] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [examDates, setExamDates] = useState<any[]>([]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const displayName = useMemo(() => {
    return user?.displayName || user?.email?.split('@')[0] || user?.phoneNumber || "Student";
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Listen for daily tip
    const unsubTip = onSnapshot(doc(db, "settings", "dailyTip"), (docSnap) => {
      if (docSnap.exists()) setDailyTip(docSnap.data().text);
    });

    // Listen for announcements
    const unsubAnnouncements = onSnapshot(query(collection(db, "announcements"), where("active", "==", true), orderBy("createdAt", "desc"), limit(3)), (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen for exam dates
    const unsubExamDates = onSnapshot(query(collection(db, "examDates"), orderBy("date", "asc"), limit(5)), (snapshot) => {
      setExamDates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen for user document changes (avatar, photo)
    const userRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAvatarId(data.avatarId || "girl_1");
        setPhotoURL(data.photoURL || "");
      }
    });

    const statsRef = doc(db, "userStats", user.uid);
    const unsubscribe = onSnapshot(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPoints(data.points || 0);
        setStreak(data.streak || 0);
        setDailyChallenge(data.dailyChallenge || null);
      }
      setLoading(false);
    }, (error) => {
      console.error("HomeView Snapshot error:", error);
      setLoading(false);
    });

    return () => {
      unsubTip();
      unsubAnnouncements();
      unsubExamDates();
      unsubUser();
      unsubscribe();
    };
  }, [user]);

  // Separate effect for rank to avoid frequent heavy queries
  useEffect(() => {
    if (!user || points === 0) return;

    const fetchRank = async () => {
      try {
        const rankQuery = query(collection(db, "userStats"), where("points", ">", points));
        const rankSnapshot = await getCountFromServer(rankQuery);
        setRank(rankSnapshot.data().count + 1);
      } catch (error) {
        console.error("Error fetching rank:", error);
      }
    };

    const timer = setTimeout(fetchRank, 1000); // Debounce rank fetch
    return () => clearTimeout(timer);
  }, [user, points]);

  const completeChallenge = async () => {
    if (!user) return;
    const { updateDoc, increment } = await import("firebase/firestore");
    const statsRef = doc(db, "userStats", user.uid);
    try {
      await updateDoc(statsRef, {
        points: increment(50),
        dailyChallenge: {
          completed: true,
          date: new Date().toISOString().split('T')[0]
        }
      });
    } catch (error) {
      console.error("Error completing challenge:", error);
    }
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="p-6 md:p-8 pt-16 space-y-8 pb-32 max-w-3xl mx-auto font-sans">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="space-y-1 relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{greeting}</p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{displayName.split(' ')[0]}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Now</span>
          </div>
        </div>
        <div 
          onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'profile' }))}
          className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-lg overflow-hidden relative cursor-pointer hover:scale-105 active:scale-95 transition-all hover:border-indigo-200 group/avatar"
        >
          {photoURL ? (
            <Image src={photoURL} alt="Profile" fill className="object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full p-1.5">
              {AVATARS.find(a => a.id === avatarId)?.svg || AVATARS[0].svg}
            </div>
          )}
          <div className="absolute inset-0 bg-indigo-600/0 group-hover/avatar:bg-indigo-600/10 transition-colors"></div>
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={ann.id} 
              className={`p-4 rounded-2xl border flex items-start gap-4 shadow-sm ${
                ann.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' : 
                ann.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
                'bg-indigo-50 border-indigo-100 text-indigo-800'
              }`}
            >
              <div className={`p-2 rounded-xl bg-white/50 shrink-0`}>
                <Bell size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm tracking-tight">{ann.title}</h4>
                <p className="text-xs font-medium opacity-80 leading-relaxed">{ann.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Daily Engagement */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Zap size={24} fill="currentColor" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Streak</p>
              <p className="font-bold text-slate-900 text-xl font-heading">{streak} <span className="text-sm text-slate-500 font-sans">Days</span></p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowTipModal(true)}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl"><Sparkles size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Tip</p>
              <p className="font-bold text-slate-800 text-xs leading-tight line-clamp-2">{dailyTip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 w-full max-w-sm text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles size={40} />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Expert Tip</h3>
              <p className="text-slate-600 font-medium leading-relaxed italic">
                &quot;{dailyTip}&quot;
              </p>
            </div>
            <button 
              onClick={() => setShowTipModal(false)}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
            >
              Got it, thanks!
            </button>
          </motion.div>
        </div>
      )}

      {/* Daily Challenge */}
      {!(dailyChallenge?.completed && dailyChallenge.date === new Date().toISOString().split('T')[0]) ? (
        <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Daily Challenge</p>
            <h3 className="font-bold text-lg">Biology: Cell Structure</h3>
          </div>
          <button onClick={completeChallenge} className="bg-white text-emerald-600 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-50 transition-colors">Start</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Trophy size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Challenge Completed!</h3>
              <p className="text-slate-500 text-xs">You earned 50 points!</p>
            </div>
          </div>
          {!isPremium && (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between gap-4">
              <p className="text-indigo-900 text-xs font-medium">
                {user?.isAnonymous 
                  ? "Save your points permanently by creating an account!" 
                  : "Want to generate a custom quiz? Upgrade to Pro!"}
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: user?.isAnonymous ? 'auth_signup' : 'premium' }))} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap"
              >
                {user?.isAnonymous ? "Create Account" : "Upgrade"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-slate-900 rounded-[32px] p-8 text-white overflow-hidden shadow-xl border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full -ml-16 -mb-16 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <AppIcon size={36} className="shadow-lg shadow-indigo-500/20" />
              <div className="flex flex-col">
                <span className="font-heading font-black text-xl tracking-tight leading-none">Educate MW</span>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Malawi&apos;s #1 Study App</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tight leading-tight flex items-center gap-2 flex-wrap">
                Muli bwanji, <br/>
                <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  {displayName.split(' ')[0]}!
                </span>
                {isPremium && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg shadow-orange-500/20 animate-pulse ml-2">PRO</span>
                )}
              </h2>
              <p className="text-slate-400 font-medium text-sm max-w-xs">Ready to ace your MSCE exams today?</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'ai' }))} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 group">
                Ask Cleo AI
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'leaderboard' }))}>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Zap size={24} fill="currentColor" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</p>
            <p className="font-bold text-slate-900 text-xl font-heading">{points.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'leaderboard' }))}>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><Trophy size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</p>
            <p className="font-bold text-slate-900 text-xl font-heading">#{rank}</p>
          </div>
        </div>
      </div>

      {/* AI Quiz Engine Shortcut */}
      <div 
        onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'quizzes' }))}
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
            <h3 className="text-2xl font-heading font-black tracking-tight">AI Quiz Engine</h3>
            <p className="text-indigo-100 text-sm font-medium max-w-[200px]">Generate personalized quizzes for your class and topic.</p>
          </div>
          <div className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:translate-x-2 transition-transform">
            <ChevronRight size={24} />
          </div>
        </div>
      </div>

      {/* Exam Countdown */}
      {examDates.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Exam Countdown</h3>
            <div className="flex items-center gap-1 text-indigo-600">
              <Calendar size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">2025 MSCE</span>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {examDates.map((exam) => {
              const daysLeft = Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={exam.id} className="min-w-[180px] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl">
                      <BookOpen size={20} />
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${daysLeft < 30 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {daysLeft}d left
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{exam.subject}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Learning Modules - Bento Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Learning Path</h3>
          <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'papers' }))} className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <BentoCard 
            icon={<HelpCircle className="text-orange-500" size={28} />} 
            label="Quizzes" 
            sub="Test knowledge"
            color="bg-orange-50 border-orange-100" 
            onClickTab="quizzes" 
          />
          <BentoCard 
            icon={<Layers className="text-blue-500" size={28} />} 
            label="Flashcards" 
            sub="Memory drills"
            color="bg-blue-50 border-blue-100" 
            onClickTab="flashcards" 
          />
          <BentoCard 
            icon={<PlayCircle className="text-rose-500" size={28} />} 
            label="Video Lessons" 
            sub="Watch & Learn"
            color="bg-rose-50 border-rose-100" 
            onClickTab="videos" 
          />
          <BentoCard 
            icon={<BookOpen className="text-emerald-500" size={28} />} 
            label="Study Hub" 
            sub="Subject notes"
            color="bg-emerald-50 border-emerald-100" 
            onClickTab="study_hub" 
          />
          <BentoCard 
            icon={<FileText className="text-amber-500" size={28} />} 
            label="Past Papers" 
            sub="2025 MANEB Prep"
            color="bg-amber-50 border-amber-100" 
            onClickTab="papers" 
            className="col-span-2"
            horizontal
          />
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Clock size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Daily Goal</h3>
              </div>
              <span className="text-indigo-600 font-bold text-sm">50%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full w-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 w-1/2 rounded-full"></div>
          </div>
          <p className="text-slate-500 text-xs mt-4 font-medium italic text-center">&quot;The beautiful thing about learning is that no one can take it away from you.&quot;</p>
      </div>
    </div>
  );
}
