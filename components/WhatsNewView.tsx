"use client";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { Sparkles, Calendar, Clock, ChevronRight, Zap, Info, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface UpdateEntry {
  id: string;
  title: string;
  content: string;
  type: "feature" | "fix" | "announcement";
  createdAt: string;
}

export default function WhatsNewView() {
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "changelog"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UpdateEntry[];
      setUpdates(updatesData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("WhatsNew Snapshot error:", err);
      setError("Failed to load updates. Please check your connection.");
      setLoading(false);
      try {
        handleFirestoreError(err, OperationType.LIST, "changelog");
      } catch (e) {
        // Error already logged to console
      }
    });

    return () => unsubscribe();
  }, []);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "feature":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: <Zap size={10} fill="currentColor" /> };
      case "fix":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: <CheckCircle2 size={10} /> };
      default:
        return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-100", icon: <Info size={10} /> };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-MW', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-6 md:p-8 pt-16 space-y-8 pb-32 max-w-3xl mx-auto font-sans">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
            <Sparkles size={20} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">What&apos;s New</h2>
        </div>
        <p className="text-slate-500 font-medium">Stay updated with the latest features and improvements in Educate MW.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 text-center space-y-4 shadow-xl shadow-red-200/40">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-red-800">{error}</h3>
            <p className="text-xs text-red-500">This might be due to a temporary server issue or missing permissions.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : updates.length === 0 ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center space-y-4 shadow-xl shadow-slate-200/40">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Calendar size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">No updates yet</h3>
            <p className="text-xs text-slate-400">We&apos;re constantly working to improve your experience. Check back soon!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {updates.map((update, idx) => {
            const styles = getTypeStyles(update.type);
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={update.id}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`${styles.bg} ${styles.text} ${styles.border} border px-2 py-0.5 rounded-full flex items-center gap-1`}>
                        {styles.icon}
                        <span className="text-[8px] font-black uppercase tracking-widest">{update.type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock size={10} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{formatDate(update.createdAt)}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{update.title}</h3>
                  </div>
                </div>
                
                <div className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {update.content}
                </div>
                
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-50 group-hover:scale-100"></div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="p-6 bg-blue-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-blue-600/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h3 className="font-black text-lg leading-tight">Automatic Updates</h3>
            <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest">System Version: 2.4.0-Stable</p>
          </div>
        </div>
        <p className="text-xs text-blue-50 font-medium leading-relaxed">
          Educate MW is updated automatically every time we deploy new code to our servers. You&apos;ll always have the latest exam papers and AI features without needing to download anything!
        </p>
      </div>
    </div>
  );
}
