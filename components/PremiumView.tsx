import { Check, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { User as FirebaseUser } from "firebase/auth";

export default function PremiumView({ user }: { user?: FirebaseUser | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 text-white rounded-xl text-sm font-medium relative z-10">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-3 relative z-10">
          <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-white text-orange-600 font-bold py-3 rounded-xl shadow-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? "Processing..." : "Upgrade Now with PayChangu"}
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
