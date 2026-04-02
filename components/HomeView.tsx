import { useState, useEffect } from "react";
import { AppIcon } from "./AppLogo";
import { BookOpen, HelpCircle, User, ChevronRight, Layers, Zap, Trophy, Clock, Sparkles, FileText } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, collection, query, where, getCountFromServer, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { AVATARS } from "@/lib/avatars";
import { motion } from "motion/react";
import { HomeSkeleton } from "./Skeleton";

export default function HomeView({ onNavigate, user, onOpenSidebar }: { onNavigate: (tab: string) => void, user?: FirebaseUser | null, onOpenSidebar: () => void }) {
  const [points, setPoints] = useState<number>(0);
  const [rank, setRank] = useState<number | string>("--");
  const [avatarId, setAvatarId] = useState<string>("girl_1");
  const [loading, setLoading] = useState(true);
  const displayName = user?.displayName || user?.email?.split('@')[0] || user?.phoneNumber || "Student";

  useEffect(() => {
    if (!user) return;

    // Fetch avatar from users collection
    const fetchUser = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setAvatarId(userSnap.data().avatarId || "girl_1");
      }
    };
    fetchUser();

    const statsRef = doc(db, "userStats", user.uid);
    const unsubscribe = onSnapshot(statsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const userPoints = snapshot.data().points || 0;
        setPoints(userPoints);

        // Fetch rank
        try {
          const rankQuery = query(collection(db, "userStats"), where("points", ">", userPoints));
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

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="p-4 pt-16 space-y-6 pb-28 max-w-2xl mx-auto">

      {/* Hero Section */}
      <div className="relative bg-slate-900 rounded-xl p-5 text-white overflow-hidden shadow-lg border border-white/5">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-600/10 rounded-full -ml-12 -mb-12 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AppIcon size={24} className="shadow-lg shadow-blue-600/20" />
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight leading-none">Educate MW</span>
                <span className="text-[6px] font-bold text-blue-400 uppercase tracking-widest">Malawi&apos;s #1 Study App</span>
              </div>
            </div>
            
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold tracking-tight leading-tight">
                Muli bwanji, <br/>
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {displayName.split(' ')[0]}!
                </span>
              </h2>
              <p className="text-slate-400 font-medium text-[10px]">Ready to ace your MSCE exams today?</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate("ai")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-[10px] shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-1.5 group">
                Ask Cleo AI
                <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative hidden md:block"
          >
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full"></div>
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 overflow-hidden flex items-center justify-center shadow-xl relative">
              <div className="w-full h-full p-2">
                {AVATARS.find(a => a.id === avatarId)?.svg || AVATARS[0].svg}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-lg shadow-lg border-2 border-slate-900">
              <Trophy size={12} className="text-white" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer active:scale-95 transition-all" onClick={() => onNavigate("leaderboard")}>
          <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg"><Zap size={16} fill="currentColor" /></div>
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Points</p>
            <p className="font-bold text-slate-800 text-xs">{points.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer active:scale-95 transition-all" onClick={() => onNavigate("leaderboard")}>
          <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg"><Trophy size={16} /></div>
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Rank</p>
            <p className="font-bold text-slate-800 text-xs">#{rank}</p>
          </div>
        </div>
      </div>

      {/* AI Quiz Engine Shortcut */}
      <div 
        onClick={() => onNavigate("quizzes")}
        className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg shadow-indigo-600/10 cursor-pointer group active:scale-[0.98] transition-all relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
          <Sparkles size={60} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[6px] font-bold uppercase tracking-widest">New</span>
              <span className="text-[7px] font-bold uppercase tracking-widest opacity-80">AI Powered</span>
            </div>
            <h3 className="text-lg font-bold leading-tight">AI Quiz Engine</h3>
            <p className="text-indigo-100 text-[9px] font-medium max-w-[160px]">Generate personalized quizzes for your class and topic.</p>
          </div>
          <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      {/* Learning Modules - Bento Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest">Learning Path</h3>
          <button onClick={() => onNavigate("papers")} className="text-blue-600 text-[9px] font-bold uppercase tracking-widest">View All</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <BentoCard 
            icon={<HelpCircle className="text-orange-500" size={20} />} 
            label="Quizzes" 
            sub="Test knowledge"
            color="bg-orange-50 border-orange-100" 
            onClick={() => onNavigate("quizzes")} 
          />
          <BentoCard 
            icon={<Layers className="text-blue-500" size={20} />} 
            label="Flashcards" 
            sub="Memory drills"
            color="bg-blue-50 border-blue-100" 
            onClick={() => onNavigate("flashcards")} 
          />
          <BentoCard 
            icon={<BookOpen className="text-emerald-500" size={20} />} 
            label="Study Notes" 
            sub="Subject materials"
            color="bg-emerald-50 border-emerald-100" 
            onClick={() => onNavigate("papers")} 
          />
          <BentoCard 
            icon={<FileText className="text-amber-500" size={20} />} 
            label="Past Papers" 
            sub="2025 MANEB Prep"
            color="bg-amber-50 border-amber-100" 
            onClick={() => onNavigate("papers")} 
          />
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-blue-600" />
                <h3 className="font-bold text-slate-800 text-xs">Daily Goal</h3>
              </div>
              <span className="text-blue-600 font-bold text-[10px]">50%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-1/2 rounded-full"></div>
          </div>
          <p className="text-slate-400 text-[9px] mt-2 font-medium italic">&quot;The beautiful thing about learning is that no one can take it away from you.&quot;</p>
      </div>
    </div>
  );
}

const BentoCard = ({ icon, label, sub, color, onClick, className = "", horizontal = false }: any) => (
  <div 
    onClick={onClick} 
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
