import { useState, useEffect } from "react";
import { AppIcon } from "./AppLogo";
import { BookOpen, HelpCircle, User, ChevronRight, Layers, Zap, Trophy, Clock, Sparkles, FileText } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, collection, query, where, getCountFromServer, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/firebase";
import { AVATARS } from "@/lib/avatars";
import { motion } from "motion/react";
import { HomeSkeleton } from "./Skeleton";
import Image from "next/image";

export default function HomeView({ onNavigate, user, isPremium, onOpenSidebar }: { onNavigate: (tab: string) => void, user?: FirebaseUser | null, isPremium?: boolean, onOpenSidebar: () => void }) {
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [rank, setRank] = useState<number | string>("--");
  const [avatarId, setAvatarId] = useState<string>("girl_1");
  const [photoURL, setPhotoURL] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState<{completed: boolean, date: string} | null>(null);
  const displayName = user?.displayName || user?.email?.split('@')[0] || user?.phoneNumber || "Student";

  useEffect(() => {
    if (!user) return;

    // Fetch avatar and photo from users collection
    const fetchUser = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setAvatarId(data.avatarId || "girl_1");
        setPhotoURL(data.photoURL || "");
      }
    };
    fetchUser();

    const statsRef = doc(db, "userStats", user.uid);
    const unsubscribe = onSnapshot(statsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPoints(data.points || 0);
        setStreak(data.streak || 0);
        setDailyChallenge(data.dailyChallenge || null);

        // Fetch rank
        try {
          const rankQuery = query(collection(db, "userStats"), where("points", ">", data.points || 0));
          const rankSnapshot = await getCountFromServer(rankQuery);
          setRank(rankSnapshot.data().count + 1);
        } catch (error) {
          console.error("Error fetching rank:", error);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("HomeView Snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const completeChallenge = async () => {
    if (!user) return;
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
    <div className="p-6 md:p-8 pt-12 space-y-8 pb-32 max-w-3xl mx-auto">

      {/* Daily Engagement */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-xl"><Zap size={24} fill="currentColor" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Streak</p>
              <p className="font-bold text-slate-800 text-lg">{streak} Days</p>
            </div>
          </div>
          <button className="w-full bg-orange-50 text-orange-700 text-[10px] font-bold py-2 rounded-lg hover:bg-orange-100 transition-all">
            View Streak
          </button>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Sparkles size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Tip</p>
              <p className="font-bold text-slate-800 text-xs leading-tight">Consistency is key to mastering complex subjects.</p>
            </div>
          </div>
          <button className="w-full bg-blue-50 text-blue-700 text-[10px] font-bold py-2 rounded-lg hover:bg-blue-100 transition-all">
            View Tip
          </button>
        </div>
      </div>

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
              <p className="text-indigo-900 text-xs font-medium">Want to generate a custom quiz? Upgrade to Pro!</p>
              <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'profile' }))} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap">Upgrade</button>
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-slate-900 rounded-2xl p-8 text-white overflow-hidden shadow-xl border border-white/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AppIcon size={32} className="shadow-lg shadow-blue-600/20" />
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none">Educate MW</span>
                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Malawi&apos;s #1 Study App</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight leading-tight flex items-center gap-2 flex-wrap">
                Muli bwanji, <br/>
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {displayName.split(' ')[0]}!
                </span>
                {isPremium && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg shadow-orange-500/20 animate-pulse">PRO</span>
                )}
              </h2>
              <p className="text-slate-400 font-medium text-xs">Ready to ace your MSCE exams today?</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'ai' }))} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2 group">
                Ask Cleo AI
                <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer active:scale-95 transition-all" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'leaderboard' }))}>
          <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Zap size={20} fill="currentColor" /></div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Points</p>
            <p className="font-bold text-slate-800 text-sm">{points.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer active:scale-95 transition-all" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'leaderboard' }))}>
          <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><Trophy size={20} /></div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rank</p>
            <p className="font-bold text-slate-800 text-sm">#{rank}</p>
          </div>
        </div>
      </div>

      {/* AI Quiz Engine Shortcut */}
      <div 
        onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'quizzes' }))}
        className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/20 cursor-pointer group active:scale-[0.98] transition-all relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Sparkles size={80} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest">New</span>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">AI Powered</span>
            </div>
            <h3 className="text-xl font-bold leading-tight">AI Quiz Engine</h3>
            <p className="text-indigo-100 text-xs font-medium max-w-[200px]">Generate personalized quizzes for your class and topic.</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all">
            <ChevronRight size={24} />
          </div>
        </div>
      </div>

      {/* Learning Modules - Bento Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Learning Path</h3>
          <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'papers' }))} className="text-blue-600 text-[10px] font-bold uppercase tracking-widest">View All</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <BentoCard 
            icon={<HelpCircle className="text-orange-500" size={24} />} 
            label="Quizzes" 
            sub="Test knowledge"
            color="bg-orange-50 border-orange-100" 
            onClickTab="quizzes" 
          />
          <BentoCard 
            icon={<Layers className="text-blue-500" size={24} />} 
            label="Flashcards" 
            sub="Memory drills"
            color="bg-blue-50 border-blue-100" 
            onClickTab="flashcards" 
          />
          <BentoCard 
            icon={<BookOpen className="text-emerald-500" size={24} />} 
            label="Study Notes" 
            sub="Subject materials"
            color="bg-emerald-50 border-emerald-100" 
            onClickTab="papers" 
          />
          <BentoCard 
            icon={<FileText className="text-amber-500" size={24} />} 
            label="Past Papers" 
            sub="2025 MANEB Prep"
            color="bg-amber-50 border-amber-100" 
            onClickTab="papers" 
          />
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Daily Goal</h3>
              </div>
              <span className="text-blue-600 font-bold text-xs">50%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full w-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-1/2 rounded-full"></div>
          </div>
          <p className="text-slate-400 text-[10px] mt-3 font-medium italic">&quot;The beautiful thing about learning is that no one can take it away from you.&quot;</p>
      </div>
    </div>
  );
}

const BentoCard = ({ icon, label, sub, color, onClickTab, className = "", horizontal = false }: any) => (
  <div 
    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: onClickTab }))} 
    className={`${color} ${className} p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md active:scale-[0.98] group flex ${horizontal ? 'flex-row items-center gap-3' : 'flex-col items-start'}`}
  >
    <div className={`p-2 bg-white rounded-lg shadow-sm mb-2 transition-transform group-hover:scale-110 ${horizontal ? 'mb-0' : ''}`}>
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-slate-800 text-xs leading-tight">{label}</h4>
      <p className="text-slate-500 text-[7px] font-bold uppercase tracking-wider mt-0.5">{sub}</p>
    </div>
  </div>
);
