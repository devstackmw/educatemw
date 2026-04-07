import { Check, Zap, Loader2, X, Star, ShieldCheck, Globe, BookOpen, Brain, Download, Clock, MessageSquare, AlertCircle, ChevronRight, ChevronDown, Quote, HelpCircle, Users, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Image from "next/image";

export default function PremiumView({ user, isPremium }: { user?: FirebaseUser | null, isPremium?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [staff, setStaff] = useState<any>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffSnap = await getDoc(doc(db, "settings", "staff"));
        if (staffSnap.exists()) {
          setStaff(staffSnap.data());
        }
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };
    fetchStaff();
  }, []);

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

  const scrollToComparison = () => {
    comparisonRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="p-4 pb-24 space-y-12 max-w-md mx-auto">
      {/* Limited Time Offer Banner - IMPROVEMENT */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-3xl text-white shadow-lg shadow-orange-500/20 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-125 transition-transform duration-700">
          <Clock size={80} />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
            <Star size={24} fill="currentColor" className="text-amber-200" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-black uppercase tracking-tight">Special Exam Offer</h4>
            <p className="text-[10px] font-bold opacity-90 leading-tight">Upgrade now and get exclusive 2026 MSCE Predicted Papers for FREE!</p>
          </div>
        </div>
      </motion.div>

      {/* Header Section */}
      <div className="text-center space-y-4 pt-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm"
        >
          <Zap size={12} fill="currentColor" />
          Elevate Your Education
        </motion.div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Unlock Your Potential</h2>
        <p className="text-slate-500 text-sm font-bold max-w-[280px] mx-auto leading-relaxed">Join thousands of students excelling with Educate MW PRO.</p>
        
        <motion.button 
          onClick={scrollToComparison}
          initial={{ y: 0 }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-4 flex flex-col items-center gap-2 mx-auto text-blue-600 font-black text-[10px] uppercase tracking-widest"
        >
          See Plans
          <ChevronDown size={20} />
        </motion.button>
      </div>

      {/* Comparison Section */}
      <div ref={comparisonRef} className="space-y-8 scroll-mt-20">
        {/* Pro Plan Card - NOW FIRST */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", damping: 15 }}
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

          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 mb-8 border border-white/10 shadow-inner space-y-8">
            <div className="space-y-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-black text-white tracking-tighter">K5,000</span>
                <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">/ month</span>
              </div>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                Unlock the full power of digital learning. Choose your preferred way to upgrade.
              </p>
            </div>

            {/* Option 1: Automatic */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-black">1</div>
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Automatic Method</h4>
              </div>
              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-amber-400/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 group text-base uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <>Pay Now (Auto-Verify) <ChevronRight size={20} /></>}
              </button>
              <p className="text-[10px] text-slate-400 text-center font-medium italic">Instant activation after payment</p>
            </div>

            <div className="h-px bg-white/10"></div>

            {/* Option 2: Manual / Support */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black">2</div>
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">Manual & Support</h4>
              </div>

              {/* Staff Profiles for Trust */}
              <div className="grid grid-cols-1 gap-4">
                {/* Manager */}
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/10 space-y-5 relative overflow-hidden group">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-slate-800 border-2 border-blue-500/30 shadow-lg relative">
                      {staff?.managerPhoto ? (
                        <Image src={staff.managerPhoto} alt="Peter Damiano" fill className="object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-white font-black text-xl">P</span>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-slate-900">
                        <ShieldCheck size={10} fill="currentColor" />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                        Peter Damiano
                        <span className="bg-blue-500/20 text-blue-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Manager</span>
                      </h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">App Verification & Support</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <a 
                      href={`https://wa.me/265987066051?text=${encodeURIComponent(`Hello Manager Peter, my automatic payment verification failed. My username is ${user?.displayName || 'Student'}. Please help me verify my account.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-slate-800 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5 shadow-lg active:scale-95"
                    >
                      <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width={18} height={18} />
                      Auto-Verify Failed?
                    </a>
                    <a 
                      href={`https://wa.me/265987066051?text=${encodeURIComponent(`Hello Manager Peter, I have a problem with my account. My username is ${user?.displayName || 'Student'}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-white/5 text-slate-300 border border-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                    >
                      <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width={18} height={18} />
                      Message Manager
                    </a>
                  </div>
                </div>

                {/* Teachers */}
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/10 space-y-5 relative overflow-hidden group">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-slate-800 border-2 border-emerald-500/30 shadow-lg relative z-20">
                          {staff?.teacher1Photo ? (
                            <Image src={staff.teacher1Photo} alt="Teacher 1" fill className="object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-white font-black text-xl">T1</span>
                          )}
                        </div>
                        <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-slate-700 border-2 border-emerald-500/30 shadow-lg relative z-10">
                          {staff?.teacher2Photo ? (
                            <Image src={staff.teacher2Photo} alt="Teacher 2" fill className="object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-white font-black text-xl">T2</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                          Our Teachers
                          <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Verified</span>
                        </h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manual Payments & Approval</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl space-y-4">
                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                      Pay directly via <span className="text-white font-bold">Airtel Money</span> or <span className="text-white font-bold">Mpamba</span> to our teachers. They will approve you immediately.
                    </p>
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-2 bg-[#ed1c24] px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                        <div className="flex items-center justify-center">
                          <span className="text-[12px] font-black text-white italic tracking-tighter leading-none">airtel</span>
                        </div>
                        <div className="w-px h-3 bg-white/20 mx-0.5"></div>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Money</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/5">
                        <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center text-[8px] font-black text-white">TNM</div>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Mpamba</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 relative z-10">
                    <a 
                      href={`https://wa.me/265986692501?text=${encodeURIComponent(`Hello Teacher Emmanuel, I want to pay manually / I have already paid. My username is ${user?.displayName || 'Student'}. Please approve my account.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all active:scale-95"
                    >
                      <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width={18} height={18} />
                      Emmanuel Muthipo: 0986 692 501
                    </a>
                    <a 
                      href={`https://wa.me/265999136433?text=${encodeURIComponent(`Hello Teacher Saidi, I want to pay manually / I have already paid. My username is ${user?.displayName || 'Student'}. Please approve my account.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all active:scale-95"
                    >
                      <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width={18} height={18} />
                      Saidi Liffa: 0999 136 433
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-400/5 border border-amber-400/10 p-4 rounded-2xl">
              <p className="text-[10px] text-amber-200/70 font-medium text-center leading-relaxed">
                <Star size={10} className="inline mr-1 mb-0.5" />
                Note: If you already paid to teachers, just message them with your username for instant approval.
              </p>
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

        {/* Free Plan Card - NOW SECOND */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
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
      </div>

      {/* Testimonials Section - IMPROVEMENT */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Success Stories</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Hear from our PRO students</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <Testimonial 
            name="Chifundo M." 
            text="The AI Teacher is a lifesaver! I got an A in Biology thanks to the detailed explanations."
            role="MSCE Candidate"
          />
          <Testimonial 
            name="Tiwonge K." 
            text="Downloading papers for offline study helped me pass even when I had no data. Best K5,000 spent!"
            role="Form 4 Student"
          />
        </div>
      </section>

      {/* FAQ Section - IMPROVEMENT */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Common Questions</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Everything you need to know</p>
        </div>
        
        <div className="space-y-3">
          <FAQItem 
            question="How long does PRO last?" 
            answer="Your PRO access lasts for 30 days from the moment of payment. You can renew at any time."
          />
          <FAQItem 
            question="Can I pay with Airtel Money?" 
            answer="Yes! Our payment system supports both TNM Mpamba and Airtel Money via the secure gateway."
          />
          <FAQItem 
            question="Is the AI Teacher really unlimited?" 
            answer="Yes! PRO students get unlimited questions with the AI Teacher to help with any subject."
          />
        </div>
      </section>

      {/* Referral Program Highlight - IMPROVEMENT */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Users size={80} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Refer & Earn</span>
          </div>
          <h3 className="text-xl font-black tracking-tight leading-tight">Need more AI Points?</h3>
          <p className="text-blue-100 text-xs font-medium leading-relaxed">
            Invite your classmates to Educate MW! For every 5 friends who join, you get 500 AI Study Points for FREE.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'profile' }))}
            className="bg-white text-blue-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            Invite Friends
          </button>
        </div>
      </motion.div>

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

function Testimonial({ name, text, role }: { name: string, text: string, role: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
      <Quote className="text-blue-100" size={24} fill="currentColor" />
      <p className="text-slate-600 text-xs italic leading-relaxed font-medium">
        &quot;{text}&quot;
      </p>
      <div className="flex items-center gap-3 pt-2">
        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-[10px]">
          {name[0]}
        </div>
        <div>
          <p className="text-xs font-black text-slate-900">{name}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{role}</p>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <span className="text-xs font-black text-slate-800 tracking-tight">{question}</span>
        <HelpCircle size={16} className={`text-slate-300 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-3">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
