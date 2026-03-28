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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
      <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Syllabus Tracker</h3>
      {syllabus.map((s) => (
        <div key={s.subject} className="space-y-3">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{s.subject}</h4>
          <div className="space-y-1">
            {s.topics.map((topic) => {
              const isCompleted = progress.find(p => p.subject === s.subject && p.topic === topic)?.completed;
              return (
                <button 
                  key={topic}
                  onClick={() => toggleTopic(s.subject, topic, !isCompleted)}
                  className="flex items-center gap-3 w-full text-sm text-slate-700 hover:bg-slate-50 p-3 rounded-xl transition-colors"
                >
                  {isCompleted ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300" />}
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
