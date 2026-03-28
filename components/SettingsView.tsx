"use client";
import { Settings, Bell, Shield, Moon, Globe, HelpCircle, ChevronRight, LogOut } from "lucide-react";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function SettingsView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const handleLogout = async () => {
    await signOut(auth);
    onNavigate("auth");
  };

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { id: "profile", label: "Profile Information", icon: <Settings size={20} />, color: "text-blue-600 bg-blue-50" },
        { id: "notifications", label: "Notifications", icon: <Bell size={20} />, color: "text-orange-600 bg-orange-50" },
        { id: "security", label: "Security", icon: <Shield size={20} />, color: "text-emerald-600 bg-emerald-50" },
      ]
    },
    {
      title: "Preferences",
      items: [
        { id: "theme", label: "Dark Mode", icon: <Moon size={20} />, color: "text-indigo-600 bg-indigo-50", toggle: true },
        { id: "language", label: "Language", icon: <Globe size={20} />, color: "text-cyan-600 bg-cyan-50", value: "English" },
      ]
    },
    {
      title: "Support",
      items: [
        { id: "help", label: "Help Center", icon: <HelpCircle size={20} />, color: "text-slate-600 bg-slate-50" },
      ]
    }
  ];

  return (
    <div className="p-6 pt-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-slate-100 text-slate-600 rounded-2xl shadow-sm"><Settings size={32} /></div>
        <div>
          <h2 className="font-black text-2xl text-slate-800">Settings</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">App Preferences</p>
        </div>
      </div>

      <div className="space-y-8 pb-10">
        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest px-2">{group.title}</h3>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              {group.items.map((item, idx) => (
                <button 
                  key={item.id}
                  onClick={() => item.id === "profile" && onNavigate("profile")}
                  className={`w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors ${idx !== group.items.length - 1 ? "border-b border-slate-50" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {"value" in item && item.value && <span className="text-xs font-bold text-slate-400">{item.value as string}</span>}
                    {"toggle" in item && item.toggle ? (
                      <div className="w-10 h-6 bg-slate-200 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    ) : (
                      <ChevronRight size={18} className="text-slate-300" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 text-red-600 rounded-[2.5rem] font-black text-sm active:scale-95 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
