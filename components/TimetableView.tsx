"use client";
import { useState } from "react";
import { Calendar, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const SUBJECTS = [
  "Mathematics", "English", "Physical Science", "Biology", 
  "Geography", "History", "Agriculture", "Bible Knowledge", "Computer Studies"
];

export default function TimetableView({ onClose }: { onClose: () => void }) {
  const [schedule, setSchedule] = useState<Record<string, Record<string, string>>>({});
  const [activeDay, setActiveDay] = useState("Monday");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Calendar className="text-blue-600" /> My Timetable
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeDay === day 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar">
          {PERIODS.map(period => (
            <div key={period} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="w-16 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {period}
              </div>
              <div className="flex-1">
                <select 
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                  value={schedule[activeDay]?.[period] || ""}
                  onChange={(e) => setSchedule(prev => ({
                    ...prev,
                    [activeDay]: { ...(prev[activeDay] || {}), [period]: e.target.value }
                  }))}
                >
                  <option value="">Free Period</option>
                  {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] text-blue-600 font-bold flex items-center gap-2">
            <Sparkles size={12} /> Your timetable is saved locally on this device.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
