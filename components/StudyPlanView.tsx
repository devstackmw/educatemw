"use client";
import { Clock, CheckCircle2, Circle, Plus, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { StudyPlanSkeleton } from "./Skeleton";

export default function StudyPlanView() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const schedule: any[] = [];

  if (loading) return <StudyPlanSkeleton />;

  return (
    <div className="p-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm"><Clock size={24} /></div>
          <div>
            <h2 className="font-black text-xl text-slate-800">Study Plan</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Daily Schedule</p>
          </div>
        </div>
        <button className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
          <Plus size={18} />
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-slate-800 text-sm">Today&apos;s Progress</h3>
          <span className="text-indigo-600 font-bold text-xs">40% Done</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 w-[40%] rounded-full"></div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest px-1">Timeline</h3>
        {schedule.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-xs font-medium">Your schedule is empty. Add tasks or generate one with AI!</p>
          </div>
        ) : schedule.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${item.completed ? "bg-emerald-100 text-emerald-600" : "bg-white border border-slate-100 text-slate-300"}`}>
                {item.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </div>
              {idx !== schedule.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1.5"></div>}
            </div>
            <div className={`flex-1 p-4 rounded-xl border transition-all ${item.completed ? "bg-slate-50 border-transparent opacity-60" : "bg-white border-slate-100 shadow-sm hover:border-indigo-200"}`}>
              <div className="flex justify-between items-start mb-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.time}</span>
                {!item.completed && <ChevronRight size={14} className="text-slate-300" />}
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{item.task}</h4>
              <p className="text-[10px] font-bold text-indigo-600 mt-0.5">{item.subject}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full bg-indigo-50 text-indigo-600 py-3 rounded-lg font-black text-xs active:scale-95 transition-all border border-indigo-100">
        Generate AI Study Plan
      </button>
    </div>
  );
}
