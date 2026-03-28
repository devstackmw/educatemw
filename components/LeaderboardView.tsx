import { useUserStats } from "@/hooks/useUserStats";
import { Trophy, Flame } from "lucide-react";

export default function LeaderboardView() {
  const { stats } = useUserStats();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
          <Trophy size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Your Points</p>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.points || 0}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
          <Flame size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Streak</p>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.streak || 0} days</p>
        </div>
      </div>
    </div>
  );
}
