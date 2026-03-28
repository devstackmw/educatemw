"use client";
import { Trophy, Medal, User, Crown } from "lucide-react";

export default function LeaderboardView() {
  const topStudents = [
    { id: 1, name: "Chisomo Banda", points: 1250, rank: 1, color: "text-amber-500 bg-amber-50 border-amber-100" },
    { id: 2, name: "Tiwonge Phiri", points: 1120, rank: 2, color: "text-slate-400 bg-slate-50 border-slate-100" },
    { id: 3, name: "Kondwani Mwale", points: 980, rank: 3, color: "text-orange-400 bg-orange-50 border-orange-100" },
    { id: 4, name: "Lumbani Gondwe", points: 850, rank: 4, color: "text-blue-400 bg-blue-50 border-blue-100" },
    { id: 5, name: "Atusaye Nyasulu", points: 720, rank: 5, color: "text-blue-400 bg-blue-50 border-blue-100" },
  ];

  return (
    <div className="p-6 pt-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl shadow-sm"><Trophy size={32} /></div>
        <div>
          <h2 className="font-black text-2xl text-slate-800">Leaderboard</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Students in Malawi</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 pt-4 pb-8">
        {/* 2nd Place */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-slate-400 relative">
            <User size={32} />
            <div className="absolute -top-2 -right-2 bg-slate-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</div>
          </div>
          <div className="h-24 w-16 bg-slate-100 rounded-t-2xl flex flex-col items-center justify-center p-2">
            <span className="text-[10px] font-black text-slate-500 text-center leading-tight">Tiwonge</span>
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-white shadow-xl flex items-center justify-center text-amber-500 relative">
            <Crown size={40} className="absolute -top-8 text-amber-500 transform -rotate-12" />
            <User size={40} />
            <div className="absolute -top-2 -right-2 bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black">1</div>
          </div>
          <div className="h-32 w-20 bg-amber-100 rounded-t-2xl flex flex-col items-center justify-center p-2">
            <span className="text-xs font-black text-amber-600 text-center leading-tight">Chisomo</span>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-orange-100 border-4 border-white shadow-lg flex items-center justify-center text-orange-400 relative">
            <User size={32} />
            <div className="absolute -top-2 -right-2 bg-orange-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">3</div>
          </div>
          <div className="h-20 w-16 bg-orange-100 rounded-t-2xl flex flex-col items-center justify-center p-2">
            <span className="text-[10px] font-black text-orange-600 text-center leading-tight">Kondwani</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest px-2">Rankings</h3>
        {topStudents.map((student) => (
          <div key={student.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border ${student.color}`}>
                {student.rank}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{student.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.points} Points</p>
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <Medal size={18} className={student.rank <= 3 ? student.color.split(' ')[0] : "text-slate-300"} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-600/20 text-center">
        <h3 className="font-black text-lg mb-2">You are Rank #152</h3>
        <p className="text-blue-100 text-xs font-medium mb-4">Complete 3 more quizzes to break into the top 100!</p>
        <button className="w-full bg-white text-blue-600 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all">
          Start Quiz Now
        </button>
      </div>
    </div>
  );
}
