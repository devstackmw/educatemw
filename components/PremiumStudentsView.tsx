"use client";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { User, Star } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { AVATARS } from "@/lib/avatars";

interface PremiumStudent {
  uid: string;
  displayName: string;
  photoURL: string;
  avatarId?: string;
  nickname?: string;
}

export default function PremiumStudentsView() {
  const [students, setStudents] = useState<PremiumStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "publicProfiles"), where("isPremium", "==", true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const premiumStudents: PremiumStudent[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isBanned) {
          premiumStudents.push({ uid: doc.id, ...data } as PremiumStudent);
        }
      });
      setStudents(premiumStudents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-slate-900 text-white pt-8 pb-12 px-6 rounded-b-2xl shadow-xl">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Star className="text-amber-400" fill="currentColor" />
          Premium Students
        </h2>
        <p className="text-slate-400 text-xs mt-1">Meet our motivated learners.</p>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold">Loading...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold">No premium students found.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {students.map((student) => (
              <motion.div
                key={student.uid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center relative border-2 border-amber-400/20">
                  {student.avatarId ? (
                    AVATARS.find(a => a.id === student.avatarId)?.svg || <User size={32} className="text-slate-400" />
                  ) : student.photoURL ? (
                    <Image src={student.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={32} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs truncate">{student.nickname || student.displayName}</h4>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star size={10} className="text-amber-500" fill="currentColor" />
                    <span className="text-[9px] font-bold text-amber-600 uppercase">Premium</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
