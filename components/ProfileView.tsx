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
    if (!profile.gender) {
      alert("Gender selection is mandatory.");
      return;
    }
    
    // Check nickname uniqueness
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("nickname", "==", profile.nickname));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.some(doc => doc.id !== user.uid)) {
      alert("Nickname is already taken.");
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
    <div className="p-4 pt-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><User size={24} /></div>
        <h2 className="font-bold text-xl text-slate-800 tracking-tight">My Profile</h2>
      </div>

      {/* Stats Card */}
      <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full -mr-12 -mt-12 blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center mb-4">
          <div className="relative group">
            <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-xl mb-2 transition-transform hover:scale-105">
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
                    {profile.gender === "boy" ? (
                      <Image src="/avatars/boy_student.svg" alt="Boy" width={80} height={80} />
                    ) : profile.gender === "girl" ? (
                      <Image src="/avatars/girl_student.svg" alt="Girl" width={80} height={80} />
                    ) : (
                      AVATARS.find(a => a.id === profile.avatarId)?.svg || AVATARS[0].svg
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg shadow-lg transition-all active:scale-90 ${
                isPremium ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-700 text-slate-400"
              }`}
            >
              {isPremium ? <Camera size={12} /> : <Zap size={12} fill="currentColor" className="text-amber-400" />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <h3 className="text-lg font-bold tracking-tight flex items-center gap-1">
            {profile.nickname || profile.realName || "Student"}
            {isPremium && (
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md shadow-lg shadow-orange-500/20 animate-pulse">PRO</span>
            )}
          </h3>
          <p className="text-blue-400 font-bold text-[8px] uppercase tracking-[0.2em] mt-0.5">MSCE Candidate</p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 backdrop-blur-sm p-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-all" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'leaderboard' }))}>
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Points</p>
            <p className="text-sm font-mono font-bold text-blue-400">{stats.points.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-all" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'leaderboard' }))}>
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Badges</p>
            <p className="text-sm font-mono font-bold text-amber-400">{stats.earnedBadges.length}</p>
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
      
      {userData && <ReferralView user={user} userData={userData} />}
      
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest px-1">Settings</h3>
        <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nickname</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={profile.nickname}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                placeholder="Choose a unique nickname"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
            >
              <option value="">Select Gender</option>
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Real Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={profile.realName}
                onChange={(e) => setProfile({ ...profile, realName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                placeholder="Your full name"
              />
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
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
