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
    { id: 1, name: "MSCE Exams", date: "July 01, 2026", color: "bg-blue-600 shadow-blue-600/20" },
    { id: 2, name: "JCE Exams", date: "June 01, 2026", color: "bg-emerald-600 shadow-emerald-600/20" },
    { id: 3, name: "PSLCE Exams", date: "June 08, 2026", color: "bg-orange-600 shadow-orange-600/20" },
  ];

  if (loading) return <ExamDatesSkeleton />;

  return (
    <div className="p-4 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm"><Calendar size={24} /></div>
        <div>
          <h2 className="font-bold text-xl text-slate-800 tracking-tight">Exam Countdown</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Malawi Exam Dates</p>
        </div>
      </div>

      <div className="space-y-4">
        {exams.map((exam) => {
          const examDate = new Date(exam.date);
          const today = new Date();
          const diffTime = examDate.getTime() - today.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return (
            <div key={exam.id} className={`${exam.color} p-6 rounded-xl text-white shadow-lg relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-0.5">{exam.name}</h3>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{exam.date}</p>
                  </div>
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                    <Bell size={16} />
                  </div>
                </div>
                
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold leading-none">{daysLeft > 0 ? daysLeft : 0}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Days Left</span>
                </div>
                
                <div className="mt-6 h-1.5 bg-white/20 rounded-full w-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.max(0, Math.min(100, (1 - daysLeft / 180) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-800">
          <div className="p-1.5 bg-slate-100 rounded-lg"><AlertCircle size={16} className="text-slate-500" /></div>
          <h3 className="font-bold text-xs">Important Notice</h3>
        </div>
        <p className="text-slate-500 text-[10px] leading-relaxed">
          These dates are based on the MANEB official calendar. Please verify with your school center for any changes or specific practical exam schedules.
        </p>
        <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg text-slate-800 font-bold text-xs hover:bg-slate-100 transition-colors">
          View Full MANEB Calendar
          <ChevronRight size={16} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
}
