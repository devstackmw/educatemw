"use client";
import { useState, useEffect } from "react";
import { doc, updateDoc, collection, addDoc, query, where, getDocs, writeBatch, increment } from "firebase/firestore";
import { db } from "@/firebase";
import { Gift, Copy, Check } from "lucide-react";
import { motion } from "motion/react";

export default function ReferralView({ user, userData }: { user: any, userData: any }) {
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  const checkReferralCode = async (code: string) => {
    setReferralCode(code);
    if (code.length >= 6) {
      setIsCheckingCode(true);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("referralCode", "==", code.toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setReferrerName(querySnapshot.docs[0].data().displayName);
      } else {
        setReferrerName(null);
      }
      setIsCheckingCode(false);
    } else {
      setReferrerName(null);
    }
  };

  useEffect(() => {
    const savedCode = window.localStorage.getItem('referralCodeFromUrl');
    if (savedCode && !userData.isPremium) {
      setTimeout(() => {
        checkReferralCode(savedCode);
      }, 0);
      window.localStorage.removeItem('referralCodeFromUrl');
    }
  }, [userData.isPremium]);

  const referralLink = typeof window !== "undefined" ? `${window.location.origin}?ref=${userData.referralCode}` : "";

  const handleRefer = async () => {
    if (!referralCode || !referrerName) return;

    // 1. Find referrer
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("referralCode", "==", referralCode.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const referrerDoc = querySnapshot.docs[0];
    const referrerData = referrerDoc.data();

    if (referrerDoc.id === user.uid) {
      return;
    }

    // 2. Create referral record and update points
    const batch = writeBatch(db);
    
    // Create referral doc
    const referralRef = doc(collection(db, "referrals"));
    batch.set(referralRef, {
      referrerUid: referrerDoc.id,
      referredUid: user.uid,
      referrerName: referrerData.displayName,
      referredName: userData.displayName,
      createdAt: new Date().toISOString()
    });

    // Update referrer points in users collection (5 AI questions)
    batch.update(referrerDoc.ref, {
      aiPoints: increment(5)
    });

    // Update referrer points in userStats collection (10 leaderboard points)
    const referrerStatsRef = doc(db, "userStats", referrerDoc.id);
    batch.update(referrerStatsRef, {
      points: increment(10)
    });

    // Update referred user points in userStats collection (10 leaderboard points)
    const referredStatsRef = doc(db, "userStats", user.uid);
    batch.update(referredStatsRef, {
      points: increment(10)
    });

    // Update referred user AI points (5 AI questions)
    const referredUserRef = doc(db, "users", user.uid);
    batch.update(referredUserRef, {
      aiPoints: increment(5)
    });

    await batch.commit();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(userData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Gift size={80} />
        </div>
        <h2 className="text-xl font-black mb-2">Refer & Earn</h2>
        <p className="text-blue-100 text-sm mb-6 leading-relaxed">
          Invite a friend and you both win! You both get 5 AI questions + 10 points. 
          Rewards are <strong>automatic</strong> when your friend joins using your link! 🤝😁
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <span className="font-mono text-lg font-black tracking-widest flex-1">{userData.referralCode}</span>
            <button onClick={copyCode} className="p-2 bg-white text-blue-600 rounded-xl shadow-sm active:scale-95 transition-all">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          
          <button 
            onClick={copyLink}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold py-3 rounded-2xl border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Copy size={18} />
            Copy Referral Link
          </button>
          
          <div className="pt-4 border-t border-white/20">
            <p className="text-xs text-center font-bold mb-3 text-blue-100">Share directly to earn AI credits faster!</p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Join me on Educate MW to prepare for MSCE exams. Use my code ${userData.referralCode} to get 5 free AI questions! ${referralLink}`)}`, '_blank')}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white py-2 rounded-xl flex items-center justify-center font-bold text-xs transition-colors"
              >
                WhatsApp
              </button>
              <button 
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(`Use my code ${userData.referralCode} on Educate MW!`)}`, '_blank')}
                className="bg-[#1877F2] hover:bg-[#166FE5] text-white py-2 rounded-xl flex items-center justify-center font-bold text-xs transition-colors"
              >
                Facebook
              </button>
              <button 
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: 'Educate MW',
                        text: `Join me on Educate MW to prepare for MSCE exams. Use my code ${userData.referralCode} to get 5 free AI questions!`,
                        url: referralLink,
                      });
                    } catch (err) {
                      console.error("Error sharing:", err);
                    }
                  } else {
                    copyLink();
                  }
                }}
                className="bg-slate-900 hover:bg-black text-white py-2 rounded-xl flex items-center justify-center font-bold text-xs transition-colors"
              >
                More (TikTok)
              </button>
            </div>
          </div>
        </div>
      </div>

      {!userData.isPremium && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-black text-slate-800 mb-1">Enter Referral Code</h3>
            <p className="text-xs text-slate-500 mb-4">Were you invited by a friend? Enter their code below.</p>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="e.g. ABC123" 
              value={referralCode}
              onChange={(e) => checkReferralCode(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
            {isCheckingCode && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {referrerName && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100"
            >
              <Check size={16} />
              <span className="text-xs font-bold">You were invited by <span className="underline">{referrerName}</span></span>
            </motion.div>
          )}

          <button 
            onClick={handleRefer} 
            disabled={!referrerName}
            className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 ${
              referrerName 
              ? "bg-slate-900 text-white shadow-slate-200" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Redeem & Support Friend
          </button>
        </div>
      )}
    </div>
  );
}
