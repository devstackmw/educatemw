import { BookOpen, BrainCircuit, TrendingUp, NotebookText } from "lucide-react";
import { User } from "firebase/auth";

export default function HomeView({ onNavigate, user }: { onNavigate: (tab: string) => void, user?: User | null }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || user?.phoneNumber || "Student";

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Moni, {displayName}! 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Ready to ace your MSCE exams?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNavigate("papers")} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
          <div className="bg-blue-600 p-3 rounded-full text-white">
            <BookOpen size={24} />
          </div>
          <span className="font-semibold text-blue-900">Past Papers</span>
        </button>
        <button onClick={() => onNavigate("quizzes")} className="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col items-center justify-center gap-2 hover:bg-green-100 transition-colors">
          <div className="bg-green-600 p-3 rounded-full text-white">
            <BrainCircuit size={24} />
          </div>
          <span className="font-semibold text-green-900">Take a Quiz</span>
        </button>
        <button onClick={() => onNavigate("notes")} className="col-span-2 bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-center gap-3 hover:bg-purple-100 transition-colors">
          <div className="bg-purple-600 p-3 rounded-full text-white">
            <NotebookText size={24} />
          </div>
          <div className="text-left">
            <span className="font-semibold text-purple-900 block">Study Notes</span>
            <span className="text-xs text-purple-700">Read and revise offline</span>
          </div>
        </button>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-600" /> Your Progress
        </h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Biology Quiz</span>
              <span className="font-bold text-green-600">85%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Mathematics</span>
              <span className="font-bold text-blue-600">60%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
