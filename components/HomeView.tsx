import { BookOpen, HelpCircle, Menu, User, ChevronRight } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";

export default function HomeView({ onNavigate, user }: { onNavigate: (tab: string) => void, user?: FirebaseUser | null }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || user?.phoneNumber || "Student";

  return (
    <div className="p-6 pt-8">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100"><Menu size={20} className="text-slate-600" /></div>
          <span className="font-black text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Edumw</span>
        </div>
        <div onClick={() => onNavigate("profile")} className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 p-0.5 shadow-sm cursor-pointer">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <User size={18} className="text-slate-400" />
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[2.5rem] p-8 text-white mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-1">Hi, {displayName.split(' ')[0]}!</h2>
          <p className="text-blue-100 font-medium mb-8 opacity-80">You&apos;re on a 5-day streak 🔥</p>
          <button onClick={() => onNavigate("ai")} className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2">
            Ask Ed-Ai Assistant
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-10">
        <Card icon={<HelpCircle className="text-orange-500" size={28} />} label="Quizzes" color="bg-orange-50 border-orange-100" onClick={() => onNavigate("quizzes")} />
        <Card icon={<BookOpen className="text-emerald-500" size={28} />} label="Library" color="bg-emerald-50 border-emerald-100" onClick={() => onNavigate("papers")} />
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800">Daily Progress</h3>
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

const Card = ({ icon, label, color, onClick }: any) => (
  <div onClick={onClick} className={`${color} p-8 rounded-[2.5rem] border flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-lg active:scale-95 group`}>
    <div className="mb-3 transition-transform group-hover:scale-110">{icon}</div>
    <span className="font-black text-slate-700">{label}</span>
  </div>
);
