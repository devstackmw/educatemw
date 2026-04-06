'use client';
import { auth, db } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldAlert, Loader2, Lock, ArrowRight, UserX } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

const AUTHORIZED_EMAILS = ["devstackmw@gmail.com", "mscepreparation@gmail.com"];

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isHacker, setIsHacker] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (loading && progress < 100) {
      const timer = setTimeout(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 15;
          return next > 100 ? 100 : next;
        });
      }, 150);
      return () => clearTimeout(timer);
    }
    
    if (progress === 100 && !error && !isHacker) {
      router.push("/admin");
    }
  }, [loading, progress, error, isHacker, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError(null);
    setIsHacker(false);
    setProgress(0);
    
    try {
      setLoading(true);
      setStatus("Authenticating with Google...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        throw new Error("No email associated with this account.");
      }

      setStatus("Verifying admin privileges...");
      
      // Check if email is in hardcoded list
      let isAuthorized = AUTHORIZED_EMAILS.includes(user.email.toLowerCase());
      
      // Also check Firestore for role: 'admin'
      if (!isAuthorized) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        setIsHacker(true);
        setError("hoops you're fake 🤥 go away");
        setLoading(false);
        await auth.signOut();
        return;
      }

      setStatus("Access granted. Preparing dashboard...");
      // Progress bar will continue to 100% via useEffect
      
    } catch (error: any) {
      console.error("Login error:", error);
      setLoading(false);
      if (error.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked. Please allow popups and try again.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-in was cancelled.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <AnimatePresence mode="wait">
        {!loading && !isHacker ? (
          <motion.div 
            key="login-card"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            className="bg-slate-800/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-700/50 shadow-2xl w-full max-w-md text-center space-y-8 relative z-10"
          >
            <div className="space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                <Lock size={44} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
                <p className="text-slate-400 text-sm font-medium mt-3 leading-relaxed">
                  Secure access for Educate MW administrators.<br />
                  Sign in with your authorized Google account.
                </p>
              </div>
            </div>
            
            {error && !isHacker && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3"
              >
                <ShieldAlert size={18} />
                {error}
              </motion.div>
            )}

            <button 
              onClick={handleLogin} 
              className="group w-full bg-white text-slate-900 py-5 rounded-2xl font-black shadow-xl hover:bg-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
              <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </motion.div>
        ) : isHacker ? (
          <motion.div 
            key="hacker-card"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="bg-red-950/40 backdrop-blur-2xl p-12 rounded-[3rem] border-2 border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] w-full max-w-md text-center space-y-8 relative z-10"
          >
            <div className="w-28 h-28 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-500/40 animate-bounce">
              <UserX size={56} strokeWidth={3} />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-red-500 tracking-tighter uppercase italic">Access Denied</h1>
              <p className="text-red-200 text-xl font-bold leading-tight">
                &quot;hoops you&apos;re fake 🤥 go away&quot;
              </p>
              <p className="text-red-400/60 text-sm font-mono">UNAUTHORIZED_ACCESS_ATTEMPT_LOGGED</p>
            </div>
            <button 
              onClick={() => setIsHacker(false)}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="loading-card"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-10 text-center relative z-10"
          >
            <div className="space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-slate-800 rounded-3xl border border-slate-700 flex items-center justify-center">
                  <Loader2 className="text-blue-500 animate-spin" size={48} strokeWidth={3} />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Please wait loading</h2>
                <p className="text-blue-400 font-bold animate-pulse tracking-wide uppercase text-xs">{status}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>System Initialization</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
