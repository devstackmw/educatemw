"use client";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { Loader2, Save, User, Trophy, Award, Star, Zap, Check } from "lucide-react";
import { AVATARS } from "@/lib/avatars";

export default function ProfileView({ user }: { user: FirebaseUser | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState({ nickname: "", realName: "", avatarId: "girl_1" });
  const [stats, setStats] = useState({ points: 0, earnedBadges: [] as string[] });

  useEffect(() => {
    if (!user) return;
    
    // Fetch user profile
    const fetchProfile = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfile({ 
          nickname: data.nickname || "", 
          realName: data.realName || "",
          avatarId: data.avatarId || "girl_1"
        });
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
      
      // Also update userStats if nickname or avatar changed
      const statsRef = doc(db, "userStats", user.uid);
      await updateDoc(statsRef, {
        displayName: profile.nickname || profile.realName || user.displayName || "Student",
        avatarId: profile.avatarId
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
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center mb-10">
          <div className="w-32 h-32 bg-white/5 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-2xl mb-6 group transition-transform hover:scale-105">
            <div className="w-full h-full p-4">
              {AVATARS.find(a => a.id === profile.avatarId)?.svg || AVATARS[0].svg}
            </div>
          </div>
          <h3 className="text-2xl font-black tracking-tight">{profile.nickname || profile.realName || "Student"}</h3>
          <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mt-1">MSCE Candidate</p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-3xl border border-white/5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Points</p>
            <p className="text-xl font-mono font-black text-blue-400">{stats.points.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-3xl border border-white/5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Badges</p>
            <p className="text-xl font-mono font-black text-amber-400">{stats.earnedBadges.length}</p>
          </div>
        </div>
        
        <div className="relative z-10 space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Badges Earned</p>
          <div className="flex flex-wrap justify-center gap-3">
            {stats.earnedBadges.length === 0 ? (
              <p className="text-xs text-white/20 font-bold italic">Complete quizzes to earn badges!</p>
            ) : (
              stats.earnedBadges.map(badgeId => (
                <div key={badgeId} className="bg-white/5 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 pr-4 shadow-lg">
                  <div className="bg-white/10 p-2 rounded-xl">
                    {getBadgeIcon(badgeId)}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{getBadgeName(badgeId)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selection */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Choose Your Avatar</h3>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">10 Styles</span>
        </div>
        
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
          <div className="grid grid-cols-5 gap-4">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setProfile({ ...profile, avatarId: avatar.id })}
                className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${
                  profile.avatarId === avatar.id 
                  ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-600/20" 
                  : "border-transparent bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="w-full h-full p-2">
                  {avatar.svg}
                </div>
                {profile.avatarId === avatar.id && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                    <Check size={8} />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6 px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Girls (1-5)</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Boys (6-10)</span>
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
