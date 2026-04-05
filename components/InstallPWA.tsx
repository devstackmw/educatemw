"use client";
import { useState, useEffect } from "react";
import { AppIcon } from "./AppLogo";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function InstallPWA({ onInstall }: { onInstall?: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if already rewarded
      const isRewarded = localStorage.getItem("pwa_install_rewarded");
      if (!isRewarded) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
      if (onInstall) onInstall();
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-50 md:left-auto md:right-8 md:bottom-8 md:w-80"
      >
        <div className="bg-slate-900 text-white p-5 rounded-[2.5rem] shadow-2xl border border-slate-800 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-2xl rounded-full -mr-12 -mt-12"></div>
          <AppIcon size={56} className="shadow-lg shadow-blue-600/20 shrink-0 relative z-10" />
          <div className="flex-1 relative z-10">
            <h3 className="font-black text-base flex items-center gap-2">
              Install App
              <span className="bg-emerald-500 text-[10px] text-white px-1.5 py-0.5 rounded-full animate-pulse">
                +10 AI Points
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1">
              Only 1MB • Offline Access • Faster Loading
            </p>
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            <button 
              onClick={handleInstallClick}
              className="bg-blue-600 text-white text-[10px] font-black px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              INSTALL
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-slate-500 hover:text-white transition-colors self-center p-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
