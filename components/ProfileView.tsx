"use client";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { Loader2, Save, User, Trophy, Award, Star, Zap, Check, Camera, Upload } from "lucide-react";
import { AVATARS } from "@/lib/avatars";
import { ProfileSkeleton } from "./Skeleton";
import ReferralView from "./ReferralView";
import Image from "next/image";

export default function ProfileView({ user, isPremium }: { user: FirebaseUser | null, isPremium?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState({ nickname: "", realName: "", avatarId: "girl_1", photoURL: "", gender: "" });
  const [stats, setStats] = useState({ points: 0, earnedBadges: [] as string[], photoURL: "" });
  const [userData, setUserData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch user profile
    const fetchProfile = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        setProfile({ 
          nickname: data.nickname || "", 
          realName: data.realName || "",
          avatarId: data.avatarId || "girl_1",
          photoURL: data.photoURL || "",
          gender: data.gender || ""
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
      setSaveStatus("Profile picture upload is a PRO feature. Join your friends in premium to unlock this!");
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
      return;
    }

    if (file.size > 500 * 1024) { // 500KB limit for base64 in Firestore
      setSaveStatus("Image is too large. Please choose an image smaller than 500KB.");
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
    if (!profile.gender) {
      setSaveStatus("Gender selection is mandatory.");
      return;
    }
    
    // Check nickname uniqueness
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("nickname", "==", profile.nickname));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.some(doc => doc.id !== user.uid)) {
      setSaveStatus("Nickname is already taken.");
      return;
    }

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

      // Also update publicProfiles if nickname or avatar or photo changed
      const publicProfileRef = doc(db, "publicProfiles", user.uid);
      await updateDoc(publicProfileRef, {
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
    <div className="p-6 md:p-8 pt-12 space-y-8 pb-32 max-w-3xl mx-auto font-sans">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl"><User size={28} /></div>
        <h2 className="font-heading font-black text-3xl text-slate-900 tracking-tight">My Profile</h2>
      </div>

      {/* Stats Card */}
      <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-600/20 rounded-full -ml-12 -mb-12 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center mb-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-2xl mb-3 transition-transform hover:scale-105">
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
                  <div className="w-full h-full p-2">
                    {AVATARS.find(a => a.id === profile.avatarId)?.svg || AVATARS[0].svg}
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg transition-all active:scale-90 ${
                isPremium ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-800 text-slate-400 border border-slate-700"
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

          <h3 className="text-2xl font-heading font-black tracking-tight flex items-center gap-2">
            {profile.nickname || profile.realName || "Student"}
            {isPremium && (
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg shadow-orange-500/20 animate-pulse">PRO</span>
            )}
          </h3>
          <p className="text-indigo-300 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">MSCE Candidate</p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3 mb-2">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'leaderboard' }))}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Points</p>
            <p className="text-2xl font-heading font-black text-indigo-400">{stats.points.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'leaderboard' }))}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Badges</p>
            <p className="text-2xl font-heading font-black text-amber-400">{stats.earnedBadges.length}</p>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest px-2">Account Details</h3>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50">
            <span className="text-sm font-bold text-slate-500">Email Address</span>
            <span className="text-sm font-bold text-slate-900">{user?.email || "Not provided"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Member Since</span>
            <span className="text-sm font-bold text-slate-900">
              {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Avatar Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Choose Your Avatar</h3>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg">2 Styles</span>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setProfile({ ...profile, avatarId: avatar.id, gender: avatar.gender })}
                className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${
                  profile.avatarId === avatar.id 
                  ? "border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-600/20 scale-105 z-10" 
                  : "border-transparent bg-slate-50 hover:bg-slate-100 hover:scale-105"
                }`}
              >
                <div className="w-full h-full p-2">
                  {avatar.svg}
                </div>
                {profile.avatarId === avatar.id && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                    <Check size={12} />
                  </div>
                )}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-slate-800 shadow-sm">
                    {avatar.gender}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {userData && <ReferralView user={user} userData={userData} />}
      
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest px-2">Profile Settings</h3>
        <div className="space-y-5 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nickname</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={profile.nickname}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900 transition-all outline-none"
                placeholder="Choose a unique nickname"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Real Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={profile.realName}
                onChange={(e) => setProfile({ ...profile, realName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900 transition-all outline-none"
                placeholder="Your full name"
              />
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-sm hover:bg-indigo-700 disabled:opacity-50 shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>

          {saveStatus && (
            <p className={`text-center text-sm font-bold mt-4 p-3 rounded-xl ${saveStatus.includes("successfully") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {saveStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
