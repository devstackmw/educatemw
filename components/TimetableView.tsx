"use client";
import React, { useState, useRef } from "react";
import { Calendar, X, Sparkles, Save, Download, Plus, Trash2, Clock, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS = [
  "07:30 - 08:30",
  "08:30 - 09:30",
  "09:30 - 10:30",
  "10:30 - 11:00", // Break
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00"
];

const SUBJECTS = [
  "Mathematics", "English", "Physical Science", "Biology", 
  "Geography", "History", "Agriculture", "Bible Knowledge", 
  "Computer Studies", "Chichewa", "Social Studies", "Life Skills"
];

const COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-indigo-500", "bg-rose-500", 
  "bg-amber-500", "bg-purple-500", "bg-cyan-500", "bg-orange-500"
];

export default function TimetableView({ onClose }: { onClose: () => void }) {
  const [schedule, setSchedule] = useState<Record<string, Record<string, string>>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("student_timetable_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved timetable", e);
        }
      }
    }
    return {};
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeCell, setActiveCell] = useState<{ day: string, time: string } | null>(null);
  const timetableRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    localStorage.setItem("student_timetable_v2", JSON.stringify(schedule));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear your entire timetable?")) {
      setSchedule({});
      localStorage.removeItem("student_timetable_v2");
    }
  };

  const handleDownload = async () => {
    if (!timetableRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(timetableRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        logging: false,
        useCORS: true,
        windowWidth: 1200
      });
      const link = document.createElement("a");
      link.download = `EducateMW_Timetable_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const updateCell = (day: string, time: string, subject: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [time]: subject }
    }));
    setActiveCell(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] w-full max-w-6xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] flex flex-col relative my-8 border border-white/20"
      >
        {/* Header */}
        <div className="p-6 md:p-10 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-30 rounded-t-[3rem] gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 rotate-3">
              <Calendar size={28} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Personal Timetable</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Malawi 2026 Academic Year</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button 
              onClick={handleSave}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap ${
                isSaved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800'
              }`}
            >
              <Save size={16} />
              {isSaved ? "Saved!" : "Save"}
            </button>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50 font-black text-xs uppercase tracking-widest"
            >
              {isDownloading ? <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /> : <Download size={16} />}
              Export
            </button>
            <button 
              onClick={handleReset}
              className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all active:scale-95"
              title="Clear All"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={onClose} 
              className="p-3.5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Timetable Grid Container */}
        <div className="p-6 md:p-10 overflow-x-auto custom-scrollbar">
          <div ref={timetableRef} className="min-w-[1000px] bg-white p-6 rounded-[2rem] border border-slate-100 shadow-inner">
            {/* Timetable Header Branding (Visible in Download) */}
            <div className="hidden print:block mb-10 text-center">
              <div className="inline-block px-4 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-2">Educate MW</div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Study Schedule</h1>
              <p className="text-sm font-medium text-slate-400 mt-1 italic">&quot;The secret of your future is hidden in your daily routine.&quot;</p>
            </div>

            <div className="grid grid-cols-7 gap-4">
              {/* Corner Cell */}
              <div className="h-14 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
                <Clock size={18} className="text-slate-300" />
              </div>
              
              {/* Day Headers */}
              {DAYS.map(day => (
                <div key={day} className="h-14 flex items-center justify-center bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 border border-indigo-500">
                  <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{day}</span>
                </div>
              ))}

              {/* Time Slots & Cells */}
              {TIME_SLOTS.map((time, timeIdx) => (
                <React.Fragment key={time}>
                  {/* Time Label */}
                  <div className="h-28 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 p-3 text-center transition-colors hover:bg-slate-100">
                    <span className="text-[10px] font-black text-slate-900 leading-tight">{time.split(' - ')[0]}</span>
                    <div className="w-6 h-[2px] bg-indigo-200 my-2 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-400 leading-tight">{time.split(' - ')[1]}</span>
                  </div>

                  {/* Day Cells */}
                  {DAYS.map(day => {
                    const subject = schedule[day]?.[time] || "";
                    const isBreak = time.includes("Break") || timeIdx === 3;
                    
                    if (isBreak) {
                      return (
                        <div key={`${day}-${time}`} className="h-28 bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center group relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] rotate-[-45deg] relative z-10">Break</span>
                        </div>
                      );
                    }

                    const subjectColor = subject ? COLORS[SUBJECTS.indexOf(subject) % COLORS.length] : "bg-white";

                    return (
                      <div key={`${day}-${time}`} className="group relative h-28">
                        <button 
                          onClick={() => setActiveCell({ day, time })}
                          className={`w-full h-full p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden ${
                            subject 
                            ? `${subjectColor} text-white border-transparent shadow-xl shadow-current/20 scale-[0.98] hover:scale-100` 
                            : "bg-white border-slate-100 text-slate-300 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-lg hover:shadow-indigo-100"
                          }`}
                        >
                          {subject ? (
                            <>
                              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-1">
                                <BookOpen size={14} />
                              </div>
                              <span className="font-black text-[11px] leading-tight uppercase tracking-tight">{subject}</span>
                            </>
                          ) : (
                            <Plus size={20} className="opacity-40 group-hover:scale-110 transition-transform" />
                          )}
                        </button>
                        
                        {subject && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCell(day, time, "");
                            }}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-white text-rose-500 rounded-full shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-rose-100 hover:bg-rose-500 hover:text-white z-10"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-8 md:p-10 bg-slate-50 rounded-b-[3rem] border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Stay Consistent!</p>
                <p className="text-xs text-slate-500">Download your schedule and set it as your lock screen.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
              <BookOpen size={14} className="text-indigo-600" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Malawi Curriculum 2026</span>
            </div>
          </div>
        </div>

        {/* Subject Selector Modal */}
        <AnimatePresence>
          {activeCell && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-slate-100"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Select Subject</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeCell.day} • {activeCell.time}</p>
                  </div>
                  <button 
                    onClick={() => setActiveCell(null)}
                    className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {SUBJECTS.map((sub, idx) => (
                    <button
                      key={sub}
                      onClick={() => updateCell(activeCell.day, activeCell.time, sub)}
                      className="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all text-left group"
                    >
                      <div className={`w-3 h-3 rounded-full ${COLORS[idx % COLORS.length]}`}></div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">{sub}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => updateCell(activeCell.day, activeCell.time, "")}
                    className="col-span-2 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 transition-all text-xs font-bold uppercase tracking-widest"
                  >
                    <Trash2 size={14} />
                    Clear Slot
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
