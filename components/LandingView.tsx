"use client";
import { motion } from "motion/react";
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
              <span>Malawi's #1 Study App</span>
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
      <section className="py-16 px-6 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Everything you need</h2>
          <p className="text-slate-500 text-sm font-medium">Powerful tools to boost your grades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard 
            icon={<BookOpen size={24} className="text-blue-600" />}
            color="bg-blue-50"
            title="Past Papers Library"
            description="Comprehensive collection of MANEB past papers for all subjects."
          />
          <FeatureCard 
            icon={<Sparkles size={24} className="text-indigo-600" />}
            color="bg-indigo-50"
            title="Cleo AI Teacher"
            description="Get instant help with difficult concepts from our AI assistant."
          />
          <FeatureCard 
            icon={<Zap size={24} className="text-amber-600" />}
            color="bg-amber-50"
            title="Interactive Quizzes"
            description="Test your knowledge with curriculum-aligned quizzes."
          />
          <FeatureCard 
            icon={<Users size={24} className="text-emerald-600" />}
            color="bg-emerald-50"
            title="Student Community"
            description="Connect with fellow students to share tips and study together."
          />
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
