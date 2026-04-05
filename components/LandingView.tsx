"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, BookOpen, Trophy, Users, Shield, FileText, ChevronRight, Zap, GraduationCap, ArrowRight } from "lucide-react";
import { AppIcon } from "./AppLogo";

interface LandingViewProps {
  onGetStarted: () => void;
  onNavigate: (tab: string) => void;
}

export default function LandingView({ onGetStarted, onNavigate }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden bg-white rounded-b-[40px] shadow-sm border-b border-slate-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-48 -mt-48 blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-60"></div>
        
        <div className="relative z-10 text-center space-y-8 max-w-md mx-auto">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 rounded-full"></div>
              <AppIcon size={72} className="relative shadow-2xl shadow-indigo-600/20" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-2">
              <GraduationCap size={14} />
              <span>Malawi&apos;s #1 Study App</span>
            </div>
            <h1 className="text-5xl font-heading font-black text-slate-900 tracking-tight leading-[1.1]">
              Master Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                MSCE Exams
              </span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-base leading-relaxed font-medium px-4"
          >
            Access thousands of past papers, interactive quizzes, AI-powered tutoring, and a vibrant student community.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-4 px-4"
          >
            <button 
              onClick={onGetStarted}
              className="group w-full bg-slate-900 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-slate-800"
            >
              Start Learning Free 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-slate-400 font-medium mt-4">Join 10,000+ students across Malawi</p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 space-y-10 bg-white">
        <div className="text-center space-y-2 max-w-xs mx-auto">
          <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight leading-tight">Everything you need to excel</h2>
          <p className="text-slate-500 text-sm font-medium">Powerful tools designed specifically for the Malawi MSCE curriculum.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard 
            icon={<BookOpen size={24} className="text-blue-600" />}
            color="bg-blue-50"
            title="MSCE Past Papers"
            description="Access thousands of MANEB past papers from 2010 to 2025 for all subjects including Mathematics, English, Biology, and more."
          />
          <FeatureCard 
            icon={<Sparkles size={24} className="text-indigo-600" />}
            color="bg-indigo-50"
            title="Cleo AI Tutor"
            description="Our advanced AI teacher provides step-by-step explanations for complex problems in Science and Humanities."
          />
          <FeatureCard 
            icon={<Zap size={24} className="text-amber-600" />}
            color="bg-amber-50"
            title="Interactive MSCE Quizzes"
            description="Test your knowledge with thousands of curriculum-aligned multiple choice questions and track your progress."
          />
          <FeatureCard 
            icon={<Users size={24} className="text-emerald-600" />}
            color="bg-emerald-50"
            title="Student Community"
            description="Join a vibrant community of Malawian students. Share notes, ask questions, and study together for better results."
          />
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-md mx-auto space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight">Why Choose Educate MW?</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Educate MW is Malawi&apos;s premier digital learning platform, built specifically to help secondary school students prepare for their MSCE exams. We understand the challenges of finding quality study materials, which is why we&apos;ve centralized everything you need in one easy-to-use app.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-2xl font-black text-indigo-600 mb-1">10k+</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Students</div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-2xl font-black text-blue-600 mb-1">5k+</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Past Papers</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <FAQItem 
                question="Is Educate MW free to use?"
                answer="Yes! You can access many past papers and basic features for free. We also offer a Premium plan for unlimited AI assistance and exclusive study notes."
              />
              <FAQItem 
                question="Does it work offline?"
                answer="Absolutely. Once you've opened a paper or quiz, it's saved to your device so you can study even without an internet connection."
              />
              <FAQItem 
                question="Which subjects are covered?"
                answer="We cover all major MSCE subjects including Mathematics, English, Biology, Physical Science, Geography, History, Agriculture, and more."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-900 text-white py-16 px-6 text-center space-y-8 rounded-t-[40px] mt-auto">
        <div className="space-y-4">
          <Shield size={48} className="mx-auto text-indigo-400 opacity-80" />
          <h2 className="text-2xl font-heading font-black tracking-tight">Ready to ace your exams?</h2>
          <p className="text-slate-400 text-sm font-medium max-w-[280px] mx-auto">
            Join the fastest growing educational platform in Malawi today.
          </p>
        </div>
        <button 
          onClick={onGetStarted}
          className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full max-w-xs mx-auto block"
        >
          Create Free Account
        </button>
        
        <div className="pt-8 border-t border-slate-800 flex justify-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <button onClick={() => onNavigate("terms")} className="hover:text-white transition-colors">Terms</button>
          <button onClick={() => onNavigate("privacy")} className="hover:text-white transition-colors">Privacy</button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4"
    >
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex items-center justify-between gap-4"
      >
        <span className="font-bold text-slate-900 text-sm">{question}</span>
        <ChevronRight size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <p className="text-slate-500 text-xs font-medium leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
