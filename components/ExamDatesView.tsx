"use client";
import { Calendar, Clock, AlertCircle, ChevronRight, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { ExamDatesSkeleton } from "./Skeleton";

export default function ExamDatesView() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const exams = [
    { id: 1, name: "MSCE Exams", date: "June 15, 2026", daysLeft: 79, color: "bg-blue-600 shadow-blue-600/20" },
    { id: 2, name: "JCE Exams", date: "July 02, 2026", daysLeft: 96, color: "bg-emerald-600 shadow-emerald-600/20" },
    { id: 3, name: "PSLCE Exams", date: "May 20, 2026", daysLeft: 53, color: "bg-orange-600 shadow-orange-600/20" },
  ];

  if (loading) return <ExamDatesSkeleton />;

  return (
    <div className="p-6 pt-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm"><Calendar size={32} /></div>
        <div>
          <h2 className="font-black text-2xl text-slate-800">Exam Countdown</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Official Malawi Exam Dates</p>
        </div>
      </div>

      <div className="space-y-6">
        {exams.map((exam) => (
          <div key={exam.id} className={`${exam.color} p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black mb-1">{exam.name}</h3>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{exam.date}</p>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <Bell size={20} />
                </div>
              </div>
              
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black leading-none">{exam.daysLeft}</span>
                <span className="text-sm font-black uppercase tracking-widest opacity-80 mb-1">Days Left</span>
              </div>
              
              <div className="mt-8 h-2 bg-white/20 rounded-full w-full overflow-hidden">
                <div className="h-full bg-white w-2/3 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-slate-100 rounded-xl"><AlertCircle size={20} className="text-slate-500" /></div>
          <h3 className="font-black text-sm">Important Notice</h3>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">
          These dates are based on the MANEB official calendar. Please verify with your school center for any changes or specific practical exam schedules.
        </p>
        <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-slate-800 font-bold text-sm hover:bg-slate-100 transition-colors">
          View Full MANEB Calendar
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
}
