"use client";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, getCountFromServer, where } from "firebase/firestore";
import { db } from "@/firebase";
import { Trophy, Medal, Star, Crown, User, ArrowUp } from "lucide-react";
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

export default function LeaderboardView({ currentUserStats }: { currentUserStats?: any }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | string>("--");

  useEffect(() => {
    const q = query(
      collection(db, "userStats"),
      orderBy("points", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leaderboardData: LeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isBanned) {
          leaderboardData.push({ uid: doc.id, ...data } as LeaderboardEntry);
        }
      });
      setEntries(leaderboardData);
      setLoading(false);
    }, (error) => {
      console.error("Leaderboard Snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUserStats) return;

    const fetchUserRank = async () => {
      try {
        const rankQuery = query(collection(db, "userStats"), where("points", ">", currentUserStats.points || 0));
        const rankSnapshot = await getCountFromServer(rankQuery);
        setUserRank(rankSnapshot.data().count + 1);
      } catch (error) {
        console.error("Error fetching user rank in leaderboard:", error);
      }
    };

    fetchUserRank();
  }, [currentUserStats]);

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  const topThree = entries.slice(0, 3);
  const others = entries.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header Section */}
      <div className="bg-slate-900 text-white pt-8 pb-16 px-6 rounded-b-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/20 rounded-full -ml-16 -mb-16 blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
            <Trophy size={12} className="text-amber-400" />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Hall of Fame</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-slate-400 font-medium text-xs max-w-[180px] mx-auto">Celebrating the brightest minds in Malawi</p>
        </div>

        {/* Podium */}
        <div className="relative z-10 flex items-end justify-center gap-3 mt-8">
          {/* 2nd Place */}
          {topThree[1] && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex flex-col items-center gap-2 flex-1 max-w-[80px]"
            >
              <div className="relative group">
                <div className="w-14 h-14 rounded-xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center relative shadow-lg group-hover:scale-105 transition-transform">
                  {topThree[1].avatarId ? (
                    AVATARS.find(a => a.id === topThree[1].avatarId)?.svg || <User size={20} className="text-slate-500" />
                  ) : topThree[1].photoURL ? (
                    <Image src={topThree[1].photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={20} className="text-slate-500" />
                  )}
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-[9px] border-2 border-slate-900 shadow-lg">
                  2
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-[9px] truncate w-16">{topThree[1].displayName}</p>
                <p className="font-mono text-blue-400 text-[9px] font-bold">{topThree[1].points.toLocaleString()} pts</p>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="flex flex-col items-center gap-3 flex-1 max-w-[100px] -translate-y-4"
            >
              <div className="relative group">
                <motion.div 
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400"
                >
                  <Crown size={24} fill="currentColor" className="drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                </motion.div>
                <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border-2 border-amber-400 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)] relative group-hover:scale-105 transition-transform">
                  {topThree[0].avatarId ? (
                    AVATARS.find(a => a.id === topThree[0].avatarId)?.svg || <User size={28} className="text-amber-400" />
                  ) : topThree[0].photoURL ? (
                    <Image src={topThree[0].photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={28} className="text-amber-400" />
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-xs border-2 border-slate-900 shadow-xl">
                  1
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-[10px] truncate w-20">{topThree[0].displayName}</p>
                <p className="font-mono text-amber-400 text-[10px] font-bold">{topThree[0].points.toLocaleString()} pts</p>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex flex-col items-center gap-2 flex-1 max-w-[80px]"
            >
              <div className="relative group">
                <div className="w-14 h-14 rounded-xl bg-slate-800 border-2 border-orange-900/50 overflow-hidden flex items-center justify-center relative shadow-lg group-hover:scale-105 transition-transform">
                  {topThree[2].avatarId ? (
                    AVATARS.find(a => a.id === topThree[2].avatarId)?.svg || <User size={20} className="text-orange-500" />
                  ) : topThree[2].photoURL ? (
                    <Image src={topThree[2].photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={20} className="text-orange-500" />
                  )}
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-slate-900 font-bold text-[9px] border-2 border-slate-900 shadow-lg">
                  3
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-[9px] truncate w-16">{topThree[2].displayName}</p>
                <p className="font-mono text-orange-400 text-[9px] font-bold">{topThree[2].points.toLocaleString()} pts</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* List Section */}
      <div className="px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rankings</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Points</span>
          </div>
          
          <div className="divide-y divide-slate-50">
            {others.map((entry, index) => (
              <motion.div 
                key={entry.uid}
                initial={{ x: -10, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors group ${entry.uid === currentUserStats?.uid ? 'bg-blue-50/50' : ''}`}
              >
                <div className="w-5 font-mono text-[10px] font-bold text-slate-300 group-hover:text-blue-600 transition-colors">
                  {(index + 4).toString().padStart(2, '0')}
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center relative shadow-inner group-hover:scale-105 transition-transform">
                  {entry.avatarId ? (
                    AVATARS.find(a => a.id === entry.avatarId)?.svg || <User size={20} className="text-slate-400" />
                  ) : entry.photoURL ? (
                    <Image src={entry.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-800 text-xs truncate">{entry.displayName}</h4>
                    {(entry as any).isPremium && (
                      <Crown size={10} className="text-amber-500" fill="currentColor" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      {(entry as any).isPremium ? 'Premium Student' : 'Active Student'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-blue-600 text-xs">{entry.points.toLocaleString()}</p>
                  <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Total</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-6 text-center bg-slate-50/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing Top 100 Students</p>
            <p className="text-[9px] text-slate-400 mt-1">Keep studying to climb higher!</p>
          </div>
        </div>
      </div>

      {/* Current User Rank Bar */}
      {currentUserStats && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex flex-col items-center justify-center">
              <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">Rank</span>
              <span className="text-sm font-black leading-none">#{userRank}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Your Standing</p>
              <h4 className="font-black text-xs truncate">You are doing great!</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Points</p>
              <p className="font-mono font-black text-sm">{currentUserStats.points.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowUp size={16} className="text-blue-400" />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
