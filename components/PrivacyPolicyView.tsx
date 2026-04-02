"use client";
import { Shield, ChevronLeft, Lock, Eye, FileText, Globe } from "lucide-react";
import { motion } from "motion/react";

export default function PrivacyPolicyView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-white relative overflow-y-auto pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-bold text-slate-800 text-lg tracking-tight flex items-center gap-2">
          <Shield size={18} className="text-blue-600" />
          Privacy Policy
        </h1>
      </header>

      <div className="p-6 space-y-8">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Eye size={16} />
            <h2 className="font-bold text-sm uppercase tracking-widest">Introduction</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            At Educate MW, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our mobile application.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <FileText size={16} />
            <h2 className="font-bold text-sm uppercase tracking-widest">Information We Collect</h2>
          </div>
          <ul className="space-y-2 text-slate-600 text-sm leading-relaxed list-disc pl-5">
            <li><strong>Account Information:</strong> Your name, email address, and profile picture provided via Google Sign-In.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our app, including quiz scores, study progress, and community posts.</li>
            <li><strong>Device Information:</strong> Basic information about your device to ensure app compatibility and performance.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Lock size={16} />
            <h2 className="font-bold text-sm uppercase tracking-widest">How We Use Your Data</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            We use your information to provide a personalized learning experience, track your academic progress, and facilitate community interactions. We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Globe size={16} />
            <h2 className="font-bold text-sm uppercase tracking-widest">Data Security</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            We implement industry-standard security measures, including Firebase&apos;s secure authentication and database rules, to protect your data from unauthorized access or disclosure.
          </p>
        </section>

        <div className="pt-8 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium text-center">
            Last Updated: April 2, 2026<br/>
            Contact: support@educatemw.com
          </p>
        </div>
      </div>
    </div>
  );
}
