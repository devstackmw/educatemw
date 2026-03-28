"use client";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { Loader2, Save, User, Trophy, Award, Star, Zap } from "lucide-react";

export default function ProfileView({ user }: { user: FirebaseUser | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState({ nickname: "", realName: "" });
  const [stats, setStats] = useState({ points: 0, earnedBadges: [] as string[] });

  useEffect(() => {
    if (!user) return;
    
    // Fetch user profile
    const fetchProfile = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfile({ nickname: data.nickname || "", realName: data.realName || "" });
      }
      setLoading(false);
    };
    fetchProfile();

    // Fetch user stats
    const statsRef = doc(db, "userStats", user.uid);
    const unsubscribe = onSnapshot(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        setStats({
          points: snapshot.data().points || 0,
          earnedBadges: snapshot.data().earnedBadges || []
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, profile);
      
      // Also update userStats if nickname changed
      const statsRef = doc(db, "userStats", user.uid);
      await updateDoc(statsRef, {
        displayName: profile.nickname || profile.realName || user.displayName || "Student"
      });

      setSaveStatus("Profile updated successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const getBadgeIcon = (id: string) => {
    switch (id) {
      case "quiz_master": return <Trophy className="text-yellow-500" />;
      case "rising_star": return <Star className="text-blue-500" />;
      default: return <Award className="text-slate-400" />;
    }
  };

  const getBadgeName = (id: string) => {
    switch (id) {
      case "quiz_master": return "Quiz Master";
      case "rising_star": return "Rising Star";
      default: return "Achiever";
    }
  };

  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Profile...</p>
    </div>
  );

  return (
    <div className="p-6 pt-8 space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><User size={32} /></div>
        <h2 className="font-black text-2xl text-slate-800">My Profile</h2>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Zap size={24} className="text-amber-400" fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Total Points</p>
              <p className="text-2xl font-black">{stats.points.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
            Level 1
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Badges Earned ({stats.earnedBadges.length})</p>
          <div className="flex flex-wrap gap-2">
            {stats.earnedBadges.length === 0 ? (
              <p className="text-xs text-white/30 font-bold italic">Complete quizzes to earn badges!</p>
            ) : (
              stats.earnedBadges.map(badgeId => (
                <div key={badgeId} className="bg-white/5 border border-white/10 p-2 rounded-xl flex items-center gap-2 pr-3">
                  <div className="bg-white/10 p-1.5 rounded-lg">
                    {getBadgeIcon(badgeId)}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{getBadgeName(badgeId)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest px-2">Settings</h3>
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">Nickname</label>
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              placeholder="How should we call you?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">Real Name</label>
            <input
              type="text"
              value={profile.realName}
              onChange={(e) => setProfile({ ...profile, realName: e.target.value })}
              className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              placeholder="Your full name"
            />
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-sm hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>

          {saveStatus && (
            <p className={`text-center text-sm font-bold mt-2 ${saveStatus.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {saveStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
