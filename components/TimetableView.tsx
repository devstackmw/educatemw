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
  const timetableRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    localStorage.setItem("student_timetable_v2", JSON.stringify(schedule));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDownload = async () => {
    if (!timetableRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(timetableRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true
      });
      const link = document.createElement("a");
      link.download = "my-msce-timetable.png";
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
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl flex flex-col relative my-8"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20 rounded-t-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Study Timetable</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Organize your MSCE success</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                isSaved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800'
              }`}
            >
              <Save size={16} />
              {isSaved ? "Saved!" : "Save Changes"}
            </button>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
              title="Download as Image"
            >
              {isDownloading ? <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" /> : <Download size={20} />}
            </button>
            <button 
              onClick={onClose} 
              className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Timetable Grid Container */}
        <div className="p-8 overflow-x-auto no-scrollbar">
          <div ref={timetableRef} className="min-w-[800px] bg-white p-4 rounded-3xl">
            {/* Timetable Header Branding (Visible in Download) */}
            <div className="hidden print:block mb-8 text-center">
              <h1 className="text-3xl font-black text-slate-900">Educate MW</h1>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">My MSCE Study Timetable</p>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {/* Corner Cell */}
              <div className="h-12 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
                <Clock size={16} className="text-slate-400" />
              </div>
              
              {/* Day Headers */}
              {DAYS.map(day => (
                <div key={day} className="h-12 flex items-center justify-center bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">{day}</span>
                </div>
              ))}

              {/* Time Slots & Cells */}
              {TIME_SLOTS.map((time, timeIdx) => (
                <React.Fragment key={time}>
                  {/* Time Label */}
                  <div className="h-24 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-2 text-center">
                    <span className="text-[10px] font-black text-slate-400 leading-tight">{time.split(' - ')[0]}</span>
                    <div className="w-4 h-[1px] bg-slate-200 my-1"></div>
                    <span className="text-[10px] font-black text-slate-400 leading-tight">{time.split(' - ')[1]}</span>
                  </div>

                  {/* Day Cells */}
                  {DAYS.map(day => {
                    const subject = schedule[day]?.[time] || "";
                    const isBreak = time.includes("Break") || timeIdx === 3;
                    
                    if (isBreak) {
                      return (
                        <div key={`${day}-${time}`} className="h-24 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest rotate-[-45deg]">Break</span>
                        </div>
                      );
                    }

                    const subjectColor = subject ? COLORS[SUBJECTS.indexOf(subject) % COLORS.length] : "bg-white";

                    return (
                      <div key={`${day}-${time}`} className="group relative h-24">
                        <select 
                          value={subject}
                          onChange={(e) => updateCell(day, time, e.target.value)}
                          className={`w-full h-full p-3 rounded-xl border-2 transition-all appearance-none cursor-pointer text-center font-bold text-xs leading-tight flex items-center justify-center ${
                            subject 
                            ? `${subjectColor} text-white border-transparent shadow-md` 
                            : "bg-white border-slate-100 text-slate-300 hover:border-indigo-200 hover:bg-indigo-50/30"
                          }`}
                        >
                          <option value="">+</option>
                          {SUBJECTS.map(sub => <option key={sub} value={sub} className="text-slate-900 bg-white">{sub}</option>)}
                        </select>
                        {subject && (
                          <button 
                            onClick={() => updateCell(day, time, "")}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white text-rose-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-rose-100"
                          >
                            <X size={12} />
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
        <div className="p-8 bg-slate-50 rounded-b-[2.5rem] border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <Sparkles size={18} />
              </div>
              <p className="text-sm font-medium text-slate-600">
                Tip: Download your timetable and set it as your wallpaper to stay focused!
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <BookOpen size={14} />
              <span>Malawi Curriculum 2025</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
