"use client";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { Loader2, Save, User, Trophy, Award, Star, Zap, Check, Camera, Upload } from "lucide-react";
import { AVATARS } from "@/lib/avatars";
import { ProfileSkeleton } from "./Skeleton";
import Image from "next/image";

export default function ProfileView({ user, isPremium }: { user: FirebaseUser | null, isPremium?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState({ nickname: "", realName: "", avatarId: "girl_1", photoURL: "" });
  const [stats, setStats] = useState({ points: 0, earnedBadges: [] as string[], photoURL: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          avatarId: data.avatarId || "girl_1",
          photoURL: data.photoURL || ""
        });
      }
      setLoading(false);
    };
    fetchProfile();

    // Fetch user stats
    const statsRef = doc(db, "userStats", user.uid);
    const unsubscribe = onSnapshot(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setStats({
          points: data.points || 0,
          earnedBadges: data.earnedBadges || [],
          photoURL: data.photoURL || ""
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isPremium) {
      alert("Profile picture upload is a PRO feature. Join your friends in premium to unlock this!");
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
      return;
    }

    if (file.size > 500 * 1024) { // 500KB limit for base64 in Firestore
      alert("Image is too large. Please choose an image smaller than 500KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, photoURL: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, profile);
      
      // Also update userStats if nickname or avatar or photo changed
      const statsRef = doc(db, "userStats", user.uid);
      await updateDoc(statsRef, {
        displayName: profile.nickname || profile.realName || user.displayName || "Student",
        avatarId: profile.avatarId,
        photoURL: profile.photoURL
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

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="p-4 pt-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><User size={24} /></div>
        <h2 className="font-bold text-xl text-slate-800 tracking-tight">My Profile</h2>
      </div>

      {/* Stats Card */}
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center mb-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-xl mb-4 transition-transform hover:scale-105">
              <div className="w-full h-full relative">
                {profile.photoURL ? (
                  <Image 
                    src={profile.photoURL} 
                    alt="Profile" 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full p-3">
                    {AVATARS.find(a => a.id === profile.avatarId)?.svg || AVATARS[0].svg}
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`absolute -bottom-1 -right-1 p-2 rounded-xl shadow-lg transition-all active:scale-90 ${
                isPremium ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-700 text-slate-400"
              }`}
            >
              {isPremium ? <Camera size={14} /> : <Zap size={14} fill="currentColor" className="text-amber-400" />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            {profile.nickname || profile.realName || "Student"}
            {isPremium && (
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-lg shadow-orange-500/20 animate-pulse">PRO</span>
            )}
          </h3>
          <p className="text-blue-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-0.5">MSCE Candidate</p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'leaderboard' }))}>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total Points</p>
            <p className="text-lg font-mono font-bold text-blue-400">{stats.points.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'leaderboard' }))}>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Badges</p>
            <p className="text-lg font-mono font-bold text-amber-400">{stats.earnedBadges.length}</p>
          </div>
        </div>
        
        <div className="relative z-10 space-y-3">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Badges Earned</p>
          <div className="flex flex-wrap justify-center gap-2">
            {stats.earnedBadges.length === 0 ? (
              <p className="text-[10px] text-white/20 font-bold italic">Complete quizzes to earn badges!</p>
            ) : (
              stats.earnedBadges.map(badgeId => (
                <div key={badgeId} className="bg-white/5 border border-white/10 p-2 rounded-xl flex items-center gap-1.5 pr-3 shadow-lg">
                  <div className="bg-white/10 p-1.5 rounded-lg">
                    {getBadgeIcon(badgeId)}
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest">{getBadgeName(badgeId)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Choose Your Avatar</h3>
          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">10 Styles</span>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg">
          <div className="grid grid-cols-5 gap-3">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setProfile({ ...profile, avatarId: avatar.id })}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  profile.avatarId === avatar.id 
                  ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-600/20" 
                  : "border-transparent bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="w-full h-full p-1.5">
                  {avatar.svg}
                </div>
                {profile.avatarId === avatar.id && (
                  <div className="absolute top-0.5 right-0.5 bg-blue-600 text-white p-0.5 rounded-full shadow-lg">
                    <Check size={6} />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-1">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Girls (1-5)</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Boys (6-10)</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest px-1">Settings</h3>
        <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Nickname</label>
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 text-xs font-medium"
              placeholder="How should we call you?"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Real Name</label>
            <input
              type="text"
              value={profile.realName}
              onChange={(e) => setProfile({ ...profile, realName: e.target.value })}
              className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 text-xs font-medium"
              placeholder="Your full name"
            />
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold text-xs hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
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
