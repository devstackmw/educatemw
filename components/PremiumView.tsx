import { Check, Zap, Loader2, X, Star, ShieldCheck, Globe, BookOpen, Brain, Download, Clock } from "lucide-react";
import { useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { motion } from "motion/react";

export default function PremiumView({ user, isPremium }: { user?: FirebaseUser | null, isPremium?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isPremium) {
    return (
      <div className="p-8 text-center space-y-6 max-w-md mx-auto pt-20">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-amber-100/50"
        >
          <ShieldCheck size={48} fill="currentColor" className="opacity-20 absolute" />
          <Star size={40} fill="currentColor" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">You&apos;re a PRO!</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Thank you for supporting Educate MW. Your account has full access to all premium features.
          </p>
        </div>
        <div className="bg-slate-900 rounded-3xl p-6 text-left space-y-4 shadow-xl">
          <h3 className="text-amber-400 font-black text-xs uppercase tracking-widest">Active Benefits</h3>
          <div className="grid grid-cols-1 gap-3">
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
          amount: 100,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
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
          className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2"
        >
          <Star size={12} fill="currentColor" />
          Upgrade Your Learning
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Choose Your Plan</h2>
        <p className="text-slate-500 text-sm font-medium">Invest in your future for less than a cup of coffee.</p>
      </div>

      {/* Comparison Section */}
      <div className="space-y-6">
        {/* Free Plan Card */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800">Free Learner</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Basic Access</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-800">K0</span>
              <p className="text-slate-400 text-[10px] font-bold">Forever</p>
            </div>
          </div>

          <div className="space-y-3">
            <FeatureItem text="Limited Past Papers" included={true} />
            <FeatureItem text="Basic AI Teacher (3 questions/day)" included={true} />
            <FeatureItem text="Online Quizzes" included={true} />
            <FeatureItem text="Offline Downloads" included={false} />
            <FeatureItem text="Video Explanations" included={false} />
            <FeatureItem text="Ad-free Experience" included={false} />
          </div>
        </motion.div>

        {/* Pro Plan Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden ring-4 ring-amber-400/30"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
          
          <div className="absolute top-6 right-8">
            <div className="bg-amber-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-bounce">
              Best Value
            </div>
          </div>

          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                Educate MW PRO
                <Zap size={20} className="text-amber-400" fill="currentColor" />
              </h3>
              <p className="text-amber-400/80 text-xs font-black uppercase tracking-[0.2em] mt-1">Premium Access</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/10">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">K100</span>
              <span className="text-slate-400 text-sm font-bold">/ month</span>
            </div>
            <p className="text-slate-400 text-[10px] font-medium mt-2">One-time payment per academic month.</p>
          </div>

          <div className="space-y-4 mb-10">
            <ProFeatureItem icon={<Download size={16} />} text="Unlimited Offline Downloads" />
            <ProFeatureItem icon={<Brain size={16} />} text="Unlimited AI Teacher Access" />
            <ProFeatureItem icon={<Globe size={16} />} text="Step-by-step Video Lessons" />
            <ProFeatureItem icon={<ShieldCheck size={16} />} text="Exclusive MANEB Exam Tips" />
            <ProFeatureItem icon={<Clock size={16} />} text="Priority Support 24/7" />
            <ProFeatureItem icon={<Zap size={16} />} text="100% Ad-Free Experience" />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 text-rose-200 rounded-2xl text-xs font-bold flex items-center gap-3"
            >
              <X size={16} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-amber-400/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Upgrade Now
                <Zap size={20} className="group-hover:animate-pulse" />
              </>
            )}
          </button>
          
          <p className="text-center text-[10px] text-slate-500 font-bold mt-6 uppercase tracking-widest">
            Secure Local Payment via PayChangu
          </p>
        </motion.div>
      </div>

      {/* Trust Badges */}
      <div className="flex justify-center items-center gap-8 opacity-40 grayscale">
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck size={24} />
          <span className="text-[8px] font-black uppercase">Secure</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Globe size={24} />
          <span className="text-[8px] font-black uppercase">Malawi</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <BookOpen size={24} />
          <span className="text-[8px] font-black uppercase">MANEB</span>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text, included }: { text: string, included: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${included ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`p-1 rounded-full ${included ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
        {included ? <Check size={12} /> : <X size={12} />}
      </div>
      <span className={`text-xs font-bold ${included ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{text}</span>
    </div>
  );
}

function ProFeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="bg-amber-400/10 text-amber-400 p-2 rounded-xl group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors">
        {icon}
      </div>
      <span className="text-sm font-black text-slate-200 group-hover:text-white transition-colors">{text}</span>
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
