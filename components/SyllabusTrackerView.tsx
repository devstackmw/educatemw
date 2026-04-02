import { useSyllabusProgress } from "@/hooks/useSyllabusProgress";
import { CheckCircle2, Circle } from "lucide-react";

export default function SyllabusTrackerView() {
  const { progress, loading, toggleTopic } = useSyllabusProgress();

  if (loading) return <div className="text-sm text-slate-500 p-4">Loading progress...</div>;

  // Mock syllabus data for demonstration
  const syllabus = [
    { subject: "Biology", topics: ["Cell Structure", "Photosynthesis", "Genetics"] },
    { subject: "Mathematics", topics: ["Algebra", "Geometry", "Trigonometry"] }
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-4">
      <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Syllabus Tracker</h3>
      {syllabus.map((s) => (
        <div key={s.subject} className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.subject}</h4>
          <div className="space-y-1">
            {s.topics.map((topic) => {
              const isCompleted = progress.find(p => p.subject === s.subject && p.topic === topic)?.completed;
              return (
                <button 
                  key={topic}
                  onClick={() => toggleTopic(s.subject, topic, !isCompleted)}
                  className="flex items-center gap-2 w-full text-xs text-slate-700 hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  {isCompleted ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300" />}
                  <span className={isCompleted ? "line-through text-slate-400" : ""}>{topic}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
