"use client";
import { Settings, Bell, Shield, Moon, Globe, HelpCircle, ChevronRight, LogOut, FileText } from "lucide-react";
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
      title: "Legal",
      items: [
        { id: "privacy", label: "Privacy Policy", icon: <Shield size={20} />, color: "text-blue-600 bg-blue-50" },
        { id: "terms", label: "Terms of Service", icon: <FileText size={20} />, color: "text-slate-600 bg-slate-50" },
      ]
    },
    {
      title: "App",
      items: [
        { id: "updates", label: "Check for Updates", icon: <Globe size={20} />, color: "text-blue-600 bg-blue-50", value: process.env.NEXT_PUBLIC_APP_VERSION || "v1.1.0" },
        { id: "help", label: "Help Center", icon: <HelpCircle size={20} />, color: "text-slate-600 bg-slate-50" },
      ]
    }
  ];

  const handleItemClick = (id: string) => {
    if (id === "profile") onNavigate("profile");
    if (id === "privacy") onNavigate("privacy");
    if (id === "terms") onNavigate("terms");
    if (id === "updates") {
      if (confirm("Check for the latest version of Educate MW? This will refresh the app.")) {
        window.location.reload();
      }
    }
  };

  return (
    <div className="p-4 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl shadow-sm"><Settings size={24} /></div>
        <div>
          <h2 className="font-black text-xl text-slate-800">Settings</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">App Preferences</p>
        </div>
      </div>

      <div className="space-y-6 pb-10">
        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest px-1">{group.title}</h3>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {group.items.map((item, idx) => (
                <button 
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${idx !== group.items.length - 1 ? "border-b border-slate-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="font-bold text-slate-700 text-xs">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {"value" in item && item.value && <span className="text-[10px] font-bold text-slate-400">{item.value as string}</span>}
                    {"toggle" in item && item.toggle ? (
                      <div className="w-8 h-5 bg-slate-200 rounded-full relative">
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    ) : (
                      <ChevronRight size={16} className="text-slate-300" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl font-black text-xs active:scale-95 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
