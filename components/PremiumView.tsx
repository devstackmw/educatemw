import { Check, Zap } from "lucide-react";

export default function PremiumView() {
  return (
    <div className="p-4 pb-10">
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Zap size={120} />
        </div>
        <h2 className="text-2xl font-black mb-2 relative z-10">Educate MW PRO</h2>
        <p className="text-amber-50 text-sm mb-6 relative z-10">Unlock your full potential and ace your exams.</p>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 relative z-10">
          <div className="text-4xl font-black mb-1">K5,000</div>
          <div className="text-amber-100 text-xs font-medium uppercase tracking-wider">Per Term</div>
        </div>

        <div className="space-y-3 text-left relative z-10">
          <Feature text="Unlimited Past Paper Downloads" />
          <Feature text="Offline Mode (Study without Data)" />
          <Feature text="Step-by-step Video Explanations" />
          <Feature text="AI Tutor for Instant Help" />
          <Feature text="Ad-free Experience" />
        </div>

        <div className="mt-8 space-y-3 relative z-10">
          <button className="w-full bg-white text-orange-600 font-bold py-3 rounded-xl shadow-md hover:bg-gray-50 transition-colors">
            Pay with Airtel Money
          </button>
          <button className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-700 transition-colors">
            Pay with TNM Mpamba
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6 px-4">
        Secure payments processed locally via PayChangu. Cancel anytime.
      </p>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-amber-300/40 p-1 rounded-full">
        <Check size={14} className="text-white" />
      </div>
      <span className="text-sm font-medium text-amber-50">{text}</span>
    </div>
  );
}
