"use client";
import { Settings, Bell, Shield, Moon, Globe, HelpCircle, ChevronRight, LogOut, FileText, X } from "lucide-react";
import { auth } from "@/firebase";
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import { useState, useEffect } from "react";

export default function SettingsView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    // This effect is now empty or can be removed if not needed for other things
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    onNavigate("auth");
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notification");
      return;
    }

    if (notificationsEnabled) {
      // Can't programmatically revoke, just update state
      setNotificationsEnabled(false);
      alert("Please disable notifications in your browser settings to fully revoke access.");
    } else {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const handlePasswordReset = async () => {
    if (auth.currentUser?.email) {
      try {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        setResetSent(true);
        setTimeout(() => {
          setShowSecurityModal(false);
          setResetSent(false);
        }, 3000);
      } catch (error) {
        console.error("Error sending password reset email:", error);
        alert("Failed to send password reset email.");
      }
    } else {
      alert("No email associated with this account.");
    }
  };

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { id: "profile", label: "Profile Information", icon: <Settings size={20} />, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
        { id: "notifications", label: "Notifications", icon: <Bell size={20} />, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400", toggle: true, state: notificationsEnabled },
        { id: "security", label: "Security", icon: <Shield size={20} />, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
      ]
    },
    {
      title: "Preferences",
      items: [
        { id: "theme", label: "Dark Mode", icon: <Moon size={20} />, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400", toggle: true, state: isDarkMode },
        { id: "language", label: "Language", icon: <Globe size={20} />, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 dark:text-cyan-400", value: "English" },
      ]
    },
    {
      title: "Legal",
      items: [
        { id: "privacy", label: "Privacy Policy", icon: <Shield size={20} />, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
        { id: "terms", label: "Terms of Service", icon: <FileText size={20} />, color: "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400" },
      ]
    },
    {
      title: "App",
      items: [
        { id: "updates", label: "Check for Updates", icon: <Globe size={20} />, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400", value: process.env.NEXT_PUBLIC_APP_VERSION || "v1.1.0" },
        { id: "help", label: "Help Center", icon: <HelpCircle size={20} />, color: "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400" },
      ]
    }
  ];

  const handleItemClick = (id: string) => {
    if (id === "profile") onNavigate("profile");
    if (id === "privacy") onNavigate("privacy");
    if (id === "terms") onNavigate("terms");
    if (id === "theme") toggleDarkMode();
    if (id === "notifications") toggleNotifications();
    if (id === "security") setShowSecurityModal(true);
    if (id === "updates") {
      if (confirm("Check for the latest version of Educate MW? This will refresh the app.")) {
        window.location.reload();
      }
    }
  };

  return (
    <div className="p-4 pt-6 space-y-6 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl shadow-sm"><Settings size={24} /></div>
        <div>
          <h2 className="font-black text-xl text-slate-800 dark:text-white">Settings</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">App Preferences</p>
        </div>
      </div>

      <div className="space-y-6 pb-10">
        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h3 className="font-black text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-widest px-1">{group.title}</h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              {group.items.map((item, idx) => (
                <button 
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${idx !== group.items.length - 1 ? "border-b border-slate-50 dark:border-slate-700" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {"value" in item && item.value && <span className="text-[10px] font-bold text-slate-400">{item.value as string}</span>}
                    {"toggle" in item && item.toggle ? (
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${item.state ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.state ? 'translate-x-5' : 'translate-x-1'}`}></div>
                      </div>
                    ) : (
                      <ChevronRight size={16} className="text-slate-300 dark:text-slate-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-black text-xs active:scale-95 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Security Settings</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Manage your account security and password.
              </p>
              
              <div className="pt-4">
                {resetSent ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm">
                    Password reset email sent! Check your inbox.
                  </div>
                ) : (
                  <button 
                    onClick={handlePasswordReset}
                    className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-black text-sm active:scale-95 transition-all"
                  >
                    Send Password Reset Email
                  </button>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowSecurityModal(false)}
              className="w-full p-4 border-t border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
