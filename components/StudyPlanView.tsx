"use client";
import { Clock, CheckCircle2, Circle, Plus, ChevronRight } from "lucide-react";

export default function StudyPlanView() {
  const schedule: any[] = [];

  return (
    <div className="p-6 pt-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm"><Clock size={32} /></div>
          <div>
            <h2 className="font-black text-2xl text-slate-800">Study Plan</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Daily Schedule</p>
          </div>
        </div>
        <button className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
          <Plus size={20} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-slate-800">Today&apos;s Progress</h3>
          <span className="text-indigo-600 font-bold text-sm">40% Done</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full w-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 w-[40%] rounded-full"></div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest px-2">Timeline</h3>
        {schedule.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm font-medium">Your schedule is empty. Add tasks or generate one with AI!</p>
          </div>
        ) : schedule.map((item, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${item.completed ? "bg-emerald-100 text-emerald-600" : "bg-white border border-slate-100 text-slate-300"}`}>
                {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>
              {idx !== schedule.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-2"></div>}
            </div>
            <div className={`flex-1 p-5 rounded-3xl border transition-all ${item.completed ? "bg-slate-50 border-transparent opacity-60" : "bg-white border-slate-100 shadow-sm hover:border-indigo-200"}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.time}</span>
                {!item.completed && <ChevronRight size={16} className="text-slate-300" />}
              </div>
              <h4 className="font-bold text-slate-800">{item.task}</h4>
              <p className="text-xs font-bold text-indigo-600 mt-1">{item.subject}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full bg-indigo-50 text-indigo-600 py-4 rounded-[2rem] font-black text-sm active:scale-95 transition-all border border-indigo-100">
        Generate AI Study Plan
      </button>
    </div>
  );
}
