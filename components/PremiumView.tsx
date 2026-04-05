import { Check, Zap, Loader2, X, Star, ShieldCheck, Globe, BookOpen, Brain, Download, Clock, MessageSquare } from "lucide-react";
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
    <div className="p-4 pb-20 space-y-6 max-w-md mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-1.5 pt-2">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mb-1"
        >
          <Star size={10} fill="currentColor" />
          Upgrade Your Learning
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Choose Your Plan</h2>
        <p className="text-slate-500 text-xs font-medium">Invest in your future for less than a cup of coffee.</p>
      </div>

      {/* Comparison Section */}
      <div className="space-y-4">
        {/* Free Plan Card */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Free Learner</h3>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Basic Access</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-slate-800">K0</span>
              <p className="text-slate-400 text-[8px] font-bold">Forever</p>
            </div>
          </div>

          <div className="space-y-2.5">
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
          className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden ring-2 ring-amber-400/20"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-600/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <div className="absolute top-4 right-6">
            <div className="bg-amber-400 text-slate-900 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md">
              Best Value
            </div>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Educate MW PRO
                <Zap size={16} className="text-amber-400" fill="currentColor" />
              </h3>
              <p className="text-amber-400/80 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Premium Access</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">K100</span>
              <span className="text-slate-400 text-xs font-bold">/ month</span>
            </div>
            <p className="text-slate-400 text-[9px] font-medium mt-1.5 leading-relaxed">
              Payment is automatically processed. If it fails to verify, you can send a screenshot to our WhatsApp for manual approval.
            </p>
            <a 
              href={`https://wa.me/265987066051?text=${encodeURIComponent(`Hello Educate MW, I have made a payment for premium access. My username is ${user?.displayName || 'Student'}. Please verify my payment.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-[10px] font-bold hover:bg-emerald-500/30 transition-all"
            >
              <MessageSquare size={12} />
              Manual Verification (WhatsApp)
            </a>
          </div>

          <div className="space-y-3 mb-8">
            <ProFeatureItem icon={<Download size={14} />} text="Unlimited Offline Downloads" />
            <ProFeatureItem icon={<Brain size={14} />} text="Unlimited AI Teacher Access" />
            <ProFeatureItem icon={<Globe size={14} />} text="Step-by-step Video Lessons" />
            <ProFeatureItem icon={<ShieldCheck size={14} />} text="Exclusive MANEB Exam Tips" />
            <ProFeatureItem icon={<Clock size={14} />} text="Priority Support 24/7" />
            <ProFeatureItem icon={<Zap size={14} />} text="100% Ad-Free Experience" />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 text-rose-200 rounded-xl text-[10px] font-bold flex items-center gap-2"
            >
              <X size={14} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-400/10 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100 group text-sm"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Upgrade Now
                <Zap size={16} className="group-hover:animate-pulse" />
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
    <div className="flex items-center gap-3 group">
      <div className="bg-amber-400/10 text-amber-400 p-1.5 rounded-lg group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{text}</span>
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
