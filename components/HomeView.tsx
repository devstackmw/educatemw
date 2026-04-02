import { useState, useEffect } from "react";
import { AppIcon } from "./AppLogo";
import { BookOpen, HelpCircle, User, ChevronRight, Layers, Zap, Trophy, Clock, Sparkles } from "lucide-react";
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
    <div className="p-6 pt-20 space-y-8 pb-32">

      {/* Hero Section */}
      <div className="relative bg-slate-900 rounded-[3rem] p-8 text-white overflow-hidden shadow-2xl">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/20 rounded-full -ml-24 -mb-24 blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <AppIcon size={48} className="shadow-2xl shadow-blue-600/20" />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter leading-none">Educate MW</span>
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Malawi&apos;s #1 Study App</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tight leading-tight">
                Muli bwanji, <br/>
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {displayName.split(' ')[0]}!
                </span>
              </h2>
              <p className="text-slate-400 font-medium text-sm">Ready to ace your MSCE exams today?</p>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate("ai")} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-3 group">
                Ask Cleo AI
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[3rem] bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-white/10 overflow-hidden flex items-center justify-center shadow-2xl relative">
              <div className="w-full h-full p-4">
                {AVATARS.find(a => a.id === avatarId)?.svg || AVATARS[0].svg}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-3 rounded-2xl shadow-xl border-4 border-slate-900">
              <Trophy size={20} className="text-white" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer active:scale-95 transition-all" onClick={() => onNavigate("leaderboard")}>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Zap size={20} fill="currentColor" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</p>
            <p className="font-black text-slate-800">{points.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer active:scale-95 transition-all" onClick={() => onNavigate("leaderboard")}>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><Trophy size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</p>
            <p className="font-black text-slate-800">#{rank}</p>
          </div>
        </div>
      </div>

      {/* Learning Modules - Bento Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Learning Path</h3>
          <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest">View All</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <BentoCard 
            icon={<HelpCircle className="text-orange-500" size={28} />} 
            label="Quizzes" 
            sub="Test your knowledge"
            color="bg-orange-50 border-orange-100" 
            onClick={() => onNavigate("quizzes")} 
          />
          <BentoCard 
            icon={<Layers className="text-blue-500" size={28} />} 
            label="Flashcards" 
            sub="Quick memory drills"
            color="bg-blue-50 border-blue-100" 
            onClick={() => onNavigate("flashcards")} 
          />
          <BentoCard 
            icon={<BookOpen className="text-emerald-500" size={28} />} 
            label="Library" 
            sub="Study materials & Past Papers"
            color="bg-emerald-50 border-emerald-100" 
            onClick={() => onNavigate("papers")} 
            className="col-span-2"
            horizontal
          />
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <h3 className="font-black text-slate-800">Daily Goal</h3>
              </div>
              <span className="text-blue-600 font-bold text-sm">50%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full w-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-1/2 rounded-full"></div>
          </div>
          <p className="text-slate-400 text-xs mt-4 font-medium italic">&quot;The beautiful thing about learning is that no one can take it away from you.&quot;</p>
      </div>
    </div>
  );
}

const BentoCard = ({ icon, label, sub, color, onClick, className = "", horizontal = false }: any) => (
  <div 
    onClick={onClick} 
    className={`${color} ${className} p-6 rounded-3xl border cursor-pointer transition-all hover:shadow-md active:scale-[0.98] group flex ${horizontal ? 'flex-row items-center gap-6' : 'flex-col items-start'}`}
  >
    <div className={`p-4 bg-white rounded-2xl shadow-sm mb-4 transition-transform group-hover:scale-110 ${horizontal ? 'mb-0' : ''}`}>
      {icon}
    </div>
    <div>
      <h4 className="font-black text-slate-800 text-lg leading-tight">{label}</h4>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">{sub}</p>
    </div>
  </div>
);
