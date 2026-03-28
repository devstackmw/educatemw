"use client";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { Loader2, Save, User } from "lucide-react";

export default function ProfileView({ user }: { user: FirebaseUser | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState({ nickname: "", realName: "" });

  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, profile);
      setSaveStatus("Profile updated successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="p-6 pt-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><User size={32} /></div>
        <h2 className="font-black text-2xl text-slate-800">Edit Profile</h2>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500">Nickname</label>
          <input
            type="text"
            value={profile.nickname}
            onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
            className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500">Real Name</label>
          <input
            type="text"
            value={profile.realName}
            onChange={(e) => setProfile({ ...profile, realName: e.target.value })}
            className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          />
        </div>
      </div>
      
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-sm hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
        Save Profile
      </button>

      {saveStatus && (
        <p className={`text-center text-sm font-bold ${saveStatus.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
          {saveStatus}
        </p>
      )}
    </div>
  );
}
