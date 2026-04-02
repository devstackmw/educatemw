"use client";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { Trophy, Medal, Star, Crown, User } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { AVATARS } from "@/lib/avatars";
import { LeaderboardSkeleton } from "./Skeleton";

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
    return <LeaderboardSkeleton />;
  }

  const topThree = entries.slice(0, 3);
  const others = entries.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Section */}
      <div className="bg-slate-900 text-white pt-12 pb-24 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/20 rounded-full -ml-24 -mb-24 blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hall of Fame</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Leaderboard</h2>
          <p className="text-slate-400 font-medium text-sm max-w-[200px] mx-auto">Celebrating the brightest minds in Malawi</p>
        </div>

        {/* Podium */}
        <div className="relative z-10 flex items-end justify-center gap-4 mt-12">
          {/* 2nd Place */}
          {topThree[1] && (
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex flex-col items-center gap-3 flex-1 max-w-[100px]"
            >
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center relative shadow-lg group-hover:scale-105 transition-transform">
                  {topThree[1].avatarId ? (
                    AVATARS.find(a => a.id === topThree[1].avatarId)?.svg || <User className="text-slate-500" />
                  ) : topThree[1].photoURL ? (
                    <Image src={topThree[1].photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="text-slate-500" />
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-slate-400 rounded-full flex items-center justify-center text-slate-900 font-black text-[10px] border-2 border-slate-900 shadow-lg">
                  2
                </div>
              </div>
              <div className="text-center">
                <p className="font-black text-white text-[10px] truncate w-20">{topThree[1].displayName}</p>
                <p className="font-mono text-blue-400 text-[10px] font-bold">{topThree[1].points.toLocaleString()} pts</p>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="flex flex-col items-center gap-4 flex-1 max-w-[120px] -translate-y-6"
            >
              <div className="relative group">
                <motion.div 
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400"
                >
                  <Crown size={32} fill="currentColor" className="drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                </motion.div>
                <div className="w-24 h-24 rounded-3xl bg-amber-400/10 border-2 border-amber-400 overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.2)] relative group-hover:scale-105 transition-transform">
                  {topThree[0].avatarId ? (
                    AVATARS.find(a => a.id === topThree[0].avatarId)?.svg || <User className="text-amber-400" />
                  ) : topThree[0].photoURL ? (
                    <Image src={topThree[0].photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="text-amber-400" />
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 font-black text-sm border-4 border-slate-900 shadow-xl">
                  1
                </div>
              </div>
              <div className="text-center">
                <p className="font-black text-white text-xs truncate w-24">{topThree[0].displayName}</p>
                <p className="font-mono text-amber-400 text-xs font-bold">{topThree[0].points.toLocaleString()} pts</p>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex flex-col items-center gap-3 flex-1 max-w-[100px]"
            >
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-orange-900/50 overflow-hidden flex items-center justify-center relative shadow-lg group-hover:scale-105 transition-transform">
                  {topThree[2].avatarId ? (
                    AVATARS.find(a => a.id === topThree[2].avatarId)?.svg || <User className="text-orange-500" />
                  ) : topThree[2].photoURL ? (
                    <Image src={topThree[2].photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="text-orange-500" />
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center text-slate-900 font-black text-[10px] border-2 border-slate-900 shadow-lg">
                  3
                </div>
              </div>
              <div className="text-center">
                <p className="font-black text-white text-[10px] truncate w-20">{topThree[2].displayName}</p>
                <p className="font-mono text-orange-400 text-[10px] font-bold">{topThree[2].points.toLocaleString()} pts</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* List Section */}
      <div className="px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rankings</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points</span>
          </div>
          
          <div className="divide-y divide-slate-50">
            {others.map((entry, index) => (
              <motion.div 
                key={entry.uid}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="w-6 font-mono text-xs font-black text-slate-300 group-hover:text-blue-600 transition-colors">
                  {(index + 4).toString().padStart(2, '0')}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center relative shadow-inner group-hover:scale-110 transition-transform">
                  {entry.avatarId ? (
                    AVATARS.find(a => a.id === entry.avatarId)?.svg || <User size={24} className="text-slate-400" />
                  ) : entry.photoURL ? (
                    <Image src={entry.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={24} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-sm truncate">{entry.displayName}</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Student</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-black text-blue-600 text-sm">{entry.points.toLocaleString()}</p>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Total</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
