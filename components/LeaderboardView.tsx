"use client";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { Trophy, Medal, Star, Crown, User } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { AVATARS } from "@/lib/avatars";

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  avatarId?: string;
  points: number;
  streak: number;
}

export default function LeaderboardView() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "userStats"),
      orderBy("points", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leaderboardData: LeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        leaderboardData.push({ uid: doc.id, ...doc.data() } as LeaderboardEntry);
      });
      setEntries(leaderboardData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Leaderboard...</p>
      </div>
    );
  }

  const topThree = entries.slice(0, 3);
  const others = entries.slice(3);

  return (
    <div className="p-6 space-y-8 pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800">Leaderboard</h2>
        <p className="text-slate-400 font-bold text-sm">Top students in Malawi</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 pt-8 pb-4">
        {/* 2nd Place */}
        {topThree[1] && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2 flex-1 max-w-[100px]"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 border-4 border-slate-300 overflow-hidden flex items-center justify-center relative">
                {topThree[1].avatarId ? (
                  AVATARS.find(a => a.id === topThree[1].avatarId)?.svg || <User className="text-slate-400" />
                ) : topThree[1].photoURL ? (
                  <Image src={topThree[1].photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="text-slate-400" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-black text-xs border-2 border-white">
                2
              </div>
            </div>
            <p className="font-black text-slate-800 text-xs truncate w-full text-center">{topThree[1].displayName}</p>
            <p className="font-black text-blue-600 text-[10px]">{topThree[1].points} pts</p>
          </motion.div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-2 flex-1 max-w-[120px] -translate-y-4"
          >
            <div className="relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500">
                <Crown size={32} fill="currentColor" />
              </div>
              <div className="w-20 h-20 rounded-3xl bg-yellow-100 border-4 border-yellow-400 overflow-hidden flex items-center justify-center shadow-xl shadow-yellow-500/20 relative">
                {topThree[0].avatarId ? (
                  AVATARS.find(a => a.id === topThree[0].avatarId)?.svg || <User className="text-yellow-600" />
                ) : topThree[0].photoURL ? (
                  <Image src={topThree[0].photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="text-yellow-600" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-white">
                1
              </div>
            </div>
            <p className="font-black text-slate-800 text-sm truncate w-full text-center">{topThree[0].displayName}</p>
            <p className="font-black text-blue-600 text-xs">{topThree[0].points} pts</p>
          </motion.div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2 flex-1 max-w-[100px]"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border-4 border-orange-200 overflow-hidden flex items-center justify-center relative">
                {topThree[2].avatarId ? (
                  AVATARS.find(a => a.id === topThree[2].avatarId)?.svg || <User className="text-orange-400" />
                ) : topThree[2].photoURL ? (
                  <Image src={topThree[2].photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="text-orange-400" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-black text-xs border-2 border-white">
                3
              </div>
            </div>
            <p className="font-black text-slate-800 text-xs truncate w-full text-center">{topThree[2].displayName}</p>
            <p className="font-black text-blue-600 text-[10px]">{topThree[2].points} pts</p>
          </motion.div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {others.map((entry, index) => (
          <motion.div 
            key={entry.uid}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className="w-8 font-black text-slate-300 text-center italic">
              {index + 4}
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center relative">
              {entry.avatarId ? (
                AVATARS.find(a => a.id === entry.avatarId)?.svg || <User size={20} className="text-slate-400" />
              ) : entry.photoURL ? (
                <Image src={entry.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={20} className="text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-800 text-sm">{entry.displayName}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ranked Student</p>
            </div>
            <div className="text-right">
              <p className="font-black text-blue-600 text-sm">{entry.points}</p>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Points</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
