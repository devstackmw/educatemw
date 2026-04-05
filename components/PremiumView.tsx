import { Check, Zap, Loader2, X, Star, ShieldCheck, Globe, BookOpen, Brain, Download, Clock, MessageSquare, AlertCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { motion } from "motion/react";

export default function PremiumView({ user, isPremium }: { user?: FirebaseUser | null, isPremium?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isPremium) {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto pt-16">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-100/30"
        >
          <ShieldCheck size={32} fill="currentColor" className="opacity-20 absolute" />
          <Star size={24} fill="currentColor" />
        </motion.div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">You&apos;re a PRO!</h2>
          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            Thank you for supporting Educate MW. Your account has full access to all premium features.
          </p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-5 text-left space-y-3 shadow-lg">
          <h3 className="text-amber-400 font-bold text-[10px] uppercase tracking-widest">Active Benefits</h3>
          <div className="grid grid-cols-1 gap-2">
            <ActiveBenefit text="Unlimited AI Teacher" />
            <ActiveBenefit text="Offline Downloads Active" />
            <ActiveBenefit text="Ad-Free Learning" />
            <ActiveBenefit text="Priority Support" />
          </div>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!user) {
      setError("Please log in to upgrade.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email || "student@educatemw.com",
          firstName: user.displayName?.split(' ')[0] || "Student",
          lastName: user.displayName?.split(' ').slice(1).join(' ') || "",
          amount: 5000,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      if (data.checkoutUrl) {
        // Try to redirect the top window if in an iframe
        try {
          if (window.top) {
            window.top.location.href = data.checkoutUrl;
          } else {
            window.location.href = data.checkoutUrl;
          }
        } catch (e) {
          // Fallback if window.top is restricted
          window.location.href = data.checkoutUrl;
        }
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "An error occurred while initiating payment.");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24 space-y-8 max-w-md mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-2 pt-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm"
        >
          <Zap size={12} fill="currentColor" />
          Elevate Your Education
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Unlock Your Potential</h2>
        <p className="text-slate-500 text-xs font-bold max-w-[240px] mx-auto">Join thousands of students excelling with Educate MW PRO.</p>
      </div>

      {/* Comparison Section */}
      <div className="space-y-6">
        {/* Free Plan Card */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group hover:border-slate-200 transition-all"
        >
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
          
          <div className="relative z-10 flex justify-between items-start mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[8px] font-black uppercase tracking-widest mb-2">
                Standard
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Free Learner</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Start your journey</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-0.5">
                <span className="text-sm font-black text-slate-400">K</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">0</span>
              </div>
              <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Forever Free</p>
            </div>
          </div>

          <div className="relative z-10 space-y-4 mb-8">
            <FeatureItem text="Limited Past Papers" included={true} />
            <FeatureItem text="Basic AI Teacher (5 points)" included={true} />
            <FeatureItem text="Online Quizzes" included={true} />
            <FeatureItem text="Offline Downloads" included={false} />
            <FeatureItem text="Video Explanations" included={false} />
            <FeatureItem text="Ad-free Experience" included={false} />
          </div>

          <button 
            disabled
            className="relative z-10 w-full bg-slate-50 text-slate-400 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest border border-slate-100 cursor-not-allowed"
          >
            Current Plan
          </button>
        </motion.div>

        {/* Pro Plan Card */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 15 }}
          className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden ring-4 ring-amber-400/10"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>
          
          <div className="absolute top-6 right-8">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-amber-400 text-slate-900 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl shadow-amber-400/20"
            >
              Recommended
            </motion.div>
          </div>

          <div className="space-y-1 mb-8">
            <h3 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              Educate MW PRO
              <Zap size={20} className="text-amber-400" fill="currentColor" />
            </h3>
            <p className="text-amber-400/80 text-[10px] font-black uppercase tracking-[0.25em]">Unlimited Access</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 mb-8 border border-white/10 shadow-inner">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-white tracking-tighter">K5,000</span>
              <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">/ month</span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold mt-3 leading-relaxed">
              Unlock the full power of digital learning. One small payment for your academic success.
            </p>
            
            <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Manual Verification Option</p>
              <a 
                href={`https://wa.me/265987066051?text=${encodeURIComponent(`Hello Educate MW, I have made a payment for premium access. My username is ${user?.displayName || 'Student'}. Please verify my payment.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all active:scale-95"
              >
                <MessageSquare size={14} />
                WhatsApp Approval
              </a>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <ProFeatureItem icon={<Download size={16} />} text="Unlimited Offline Downloads" />
            <ProFeatureItem icon={<Brain size={16} />} text="Unlimited AI Teacher Access" />
            <ProFeatureItem icon={<Globe size={16} />} text="Step-by-step Video Lessons" />
            <ProFeatureItem icon={<ShieldCheck size={16} />} text="Exclusive MANEB Exam Tips" />
            <ProFeatureItem icon={<Zap size={16} />} text="100% Ad-Free Experience" />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-[10px] font-bold flex items-center gap-3"
            >
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              {error}
            </motion.div>
          )}

          <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-black py-5 rounded-[1.5rem] shadow-2xl shadow-amber-400/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100 group text-base uppercase tracking-widest"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Upgrade Now
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <div className="mt-8 flex items-center justify-center gap-4 opacity-30">
            <div className="h-px flex-1 bg-white/20"></div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Secure Payment</p>
            <div className="h-px flex-1 bg-white/20"></div>
          </div>
        </motion.div>
      </div>

      {/* Trust Badges */}
      <div className="flex justify-center items-center gap-10 opacity-30 grayscale pt-4">
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck size={28} />
          <span className="text-[9px] font-black uppercase tracking-widest">Secure</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Globe size={28} />
          <span className="text-[9px] font-black uppercase tracking-widest">Malawi</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <BookOpen size={28} />
          <span className="text-[9px] font-black uppercase tracking-widest">MANEB</span>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text, included }: { text: string, included: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${included ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
        {included ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
      </div>
      <span className={`text-[11px] font-bold ${included ? 'text-slate-700' : 'text-slate-400'}`}>{text}</span>
    </div>
  );
}

function ProFeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="shrink-0 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-900 transition-all duration-300 border border-white/5">
        {icon}
      </div>
      <span className="text-xs font-bold text-white tracking-wide">{text}</span>
    </div>
  );
}

function ActiveBenefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-amber-400/20 text-amber-400 p-1 rounded-full">
        <Check size={12} />
      </div>
      <span className="text-xs font-bold text-white">{text}</span>
    </div>
  );
}
