"use client";
import { motion } from "motion/react";
import { Sparkles, BookOpen, Trophy, Users, Shield, FileText, ChevronRight, Zap } from "lucide-react";
import { AppIcon } from "./AppLogo";

interface LandingViewProps {
  onGetStarted: () => void;
  onNavigate: (tab: string) => void;
}

export default function LandingView({ onGetStarted, onNavigate }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-6 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-100 rounded-full -ml-24 -mb-24 blur-3xl opacity-50"></div>
        
        <div className="relative z-10 text-center space-y-6 max-w-md mx-auto">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center"
          >
            <AppIcon size={64} className="shadow-2xl shadow-blue-600/20" />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Educate <span className="text-blue-600">MW</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              Malawi&apos;s #1 Study App for MSCE
            </p>
          </motion.div>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-sm leading-relaxed font-medium"
          >
            Master your MSCE exams with access to thousands of past papers, 
            interactive quizzes, AI-powered tutoring, and a vibrant student community.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-4"
          >
            <button 
              onClick={onGetStarted}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Get Started Now <ChevronRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-6 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">Everything you need to succeed</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Built for Malawian Students</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FeatureCard 
            icon={<BookOpen size={24} className="text-blue-600" />}
            title="Past Papers Library"
            description="Access a comprehensive collection of MANEB past papers for all MSCE subjects."
          />
          <FeatureCard 
            icon={<Sparkles size={24} className="text-indigo-600" />}
            title="Cleo AI Teacher"
            description="Get instant help with difficult concepts from our advanced AI study assistant."
          />
          <FeatureCard 
            icon={<Zap size={24} className="text-amber-500" />}
            title="Interactive Quizzes"
            description="Test your knowledge with curriculum-aligned quizzes and track your progress."
          />
          <FeatureCard 
            icon={<Users size={24} className="text-emerald-600" />}
            title="Student Community"
            description="Connect with fellow students across Malawi to share tips and study together."
          />
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-50 py-12 px-6 text-center space-y-6">
        <div className="flex justify-center gap-8 opacity-50 grayscale">
          <Trophy size={32} />
          <Star size={32} />
          <Award size={32} />
        </div>
        <p className="text-slate-500 text-sm font-medium italic">
          &quot;The best way to predict your future is to create it.&quot;
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 bg-slate-900 text-white space-y-8">
        <div className="flex items-center gap-3">
          <AppIcon size={32} />
          <span className="font-black text-xl tracking-tight">Educate MW</span>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Legal</h4>
            <ul className="space-y-2 text-sm font-bold text-slate-300">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Support</h4>
            <ul className="space-y-2 text-sm font-bold text-slate-300">
              <li><a href="mailto:devstackmw@gmail.com" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Help Center</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Educate MW. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4 items-start">
      <div className="p-3 bg-slate-50 rounded-2xl shrink-0">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-black text-slate-900">{title}</h3>
        <p className="text-slate-500 text-xs leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}

function Star({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Award({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}
