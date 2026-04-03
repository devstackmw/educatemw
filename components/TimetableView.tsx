"use client";
import { useState } from "react";
import { Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const SUBJECTS = [
  "Mathematics", "English", "Physical Science", "Biology", 
  "Geography", "History", "Agriculture", "Bible Knowledge", "Computer Studies"
];

export default function TimetableView({ onClose }: { onClose: () => void }) {
  const [schedule, setSchedule] = useState<Record<string, Record<string, string>>>({});

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Calendar className="text-blue-600" /> Student Timetable
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-slate-200 bg-slate-50 font-bold">Time</th>
                {DAYS.map(day => <th key={day} className="p-2 border border-slate-200 bg-slate-50 font-bold">{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period}>
                  <td className="p-2 border border-slate-200 font-bold text-slate-500">{period}</td>
                  {DAYS.map(day => (
                    <td key={`${day}-${period}`} className="p-1 border border-slate-200">
                      <select 
                        className="w-full p-1 bg-transparent text-slate-700 font-medium focus:outline-none"
                        value={schedule[day]?.[period] || ""}
                        onChange={(e) => setSchedule(prev => ({
                          ...prev,
                          [day]: { ...(prev[day] || {}), [period]: e.target.value }
                        }))}
                      >
                        <option value="">Select Subject</option>
                        {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 mt-4 italic">Your timetable is saved locally on this device.</p>
      </motion.div>
    </div>
  );
}
