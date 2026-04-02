"use client";
import { FileText, ChevronLeft, CheckCircle, AlertCircle, Scale, Gavel } from "lucide-react";
import { motion } from "motion/react";

export default function TermsOfServiceView({ onBack }: { onBack: () => void }) {
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
          <FileText size={18} className="text-blue-600" />
          Terms of Service
        </h1>
      </header>

      <div className="p-6 space-y-8">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Scale size={16} />
            <h2 className="font-bold text-sm uppercase tracking-widest">Agreement to Terms</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            By accessing or using Educate MW, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <CheckCircle size={16} />
            <h2 className="font-bold text-sm uppercase tracking-widest">User Responsibilities</h2>
          </div>
          <ul className="space-y-2 text-slate-600 text-sm leading-relaxed list-disc pl-5">
            <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li><strong>Community Conduct:</strong> You agree not to post offensive, illegal, or harmful content in the community section.</li>
            <li><strong>Academic Integrity:</strong> Our tools are intended for study purposes. Please use them responsibly and ethically.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <AlertCircle size={16} />
            <h2 className="font-bold text-sm uppercase tracking-widest">Premium Subscriptions</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Premium features are available via subscription. Payments are non-refundable, and you may cancel your subscription at any time through the app settings.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Gavel size={16} />
            <h2 className="font-bold text-sm uppercase tracking-widest">Limitation of Liability</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Educate MW is provided &quot;as is&quot; without any warranties. We are not liable for any damages arising from your use of the application or reliance on its content.
          </p>
        </section>

        <div className="pt-8 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium text-center">
            Last Updated: April 2, 2026<br/>
            Contact: legal@educatemw.com
          </p>
        </div>
      </div>
    </div>
  );
}
