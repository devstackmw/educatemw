import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, getDoc, setDoc, doc, updateDoc, limit, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { FileText, BookOpen, BrainCircuit, CheckCircle2, AlertCircle, Loader2, PlusCircle, Database, Video, Link as LinkIcon, Bell, Users, Search, ShieldCheck, ShieldAlert, Trophy, Sparkles, X, Zap, MessageSquare, Info, ShieldCheck as ShieldCheckIcon } from "lucide-react";
import { seedInitialData, seedLeaderboard } from "@/lib/seedData";

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

export default function AdminView() {
  const [activeTab, setActiveTab] = useState("note");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedingLeaderboard, setSeedingLeaderboard] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [isPremiumOnly, setIsPremiumOnly] = useState(false);

  // Note specific
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Video specific
  const [ytUrl, setYtUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // Resource specific
  const [resUrl, setResUrl] = useState("");
  const [resCategory, setResCategory] = useState("Notes");

  // Notification specific
  const [notifTitle, setNotifTitle] = useState("");
  const [notifContent, setNotifContent] = useState("");
  const [notifType, setNotifType] = useState("info"); // info, warning, success

  // Paper specific
  const [year, setYear] = useState("");
  const [level, setLevel] = useState("MSCE");
  const [size, setSize] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  // Quiz specific
  const [questionsCount, setQuestionsCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState("10 min");
  const [color, setColor] = useState("bg-slate-600");

  // User management specific
  const [userSearch, setUserSearch] = useState("");
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const searchUsers = async () => {
    if (!userSearch.trim()) return;
    setSearching(true);
    setErrorMsg("");
    try {
      // Search by email or nickname or uid
      const usersRef = collection(db, "users");
      let q = query(usersRef, where("email", "==", userSearch.trim()), limit(5));
      let snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        q = query(usersRef, where("nickname", "==", userSearch.trim()), limit(5));
        snapshot = await getDocs(q);
      }

      if (snapshot.empty) {
        q = query(usersRef, where("uid", "==", userSearch.trim()), limit(5));
        snapshot = await getDocs(q);
      }

      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFoundUsers(users);
      if (users.length === 0) {
        setErrorMsg("No users found with that email, nickname, or ID.");
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.LIST, "users");
    } finally {
      setSearching(false);
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      const publicRef = doc(db, "publicProfiles", userId);
      
      await updateDoc(userRef, {
        isPremium: !currentStatus,
        premiumUnlockedAt: !currentStatus ? new Date().toISOString() : null
      });

      await updateDoc(publicRef, {
        isPremium: !currentStatus
      });

      setFoundUsers(prev => prev.map(u => u.id === userId ? { ...u, isPremium: !currentStatus } : u));
      setSuccessMsg(`User premium status updated successfully!`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      const confirmBan = window.confirm("Are you sure you want to BAN this user? They will lose access to all features.");
      if (!confirmBan) return;
    } else {
      const confirmUnban = window.confirm("Are you sure you want to UNBAN this user?");
      if (!confirmUnban) return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      const publicRef = doc(db, "publicProfiles", userId);
      
      await updateDoc(userRef, {
        isBanned: !currentStatus
      });
      
      // Also update public profile so they are hidden from lists
      await updateDoc(publicRef, {
        isBanned: !currentStatus
      });

      setFoundUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: !currentStatus } : u));
      setSuccessMsg(`User ban status updated successfully!`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  // Changelog specific
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateType, setUpdateType] = useState("feature"); // feature, fix, announcement

  // Staff management specific
  const [managerPhoto, setManagerPhoto] = useState("");
  const [teacher1Photo, setTeacher1Photo] = useState("");
  const [teacher2Photo, setTeacher2Photo] = useState("");

  useEffect(() => {
    if (activeTab === "staff") {
      const fetchStaff = async () => {
        const staffSnap = await getDoc(doc(db, "settings", "staff"));
        if (staffSnap.exists()) {
          const data = staffSnap.data();
          setManagerPhoto(data.managerPhoto || "");
          setTeacher1Photo(data.teacher1Photo || "");
          setTeacher2Photo(data.teacher2Photo || "");
        }
      };
      fetchStaff();
    }
  }, [activeTab]);

  const updateStaff = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "staff"), {
        managerPhoto,
        teacher1Photo,
        teacher2Photo,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSuccessMsg("Staff profiles updated successfully!");
    } catch (err: any) {
      console.error("Staff update error:", err);
      setErrorMsg("Failed to update staff profiles.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubject("");
    setTopic("");
    setTitle("");
    setContent("");
    setVideoUrl("");
    setImageUrl("");
    setYtUrl("");
    setThumbnailUrl("");
    setResUrl("");
    setResCategory("Notes");
    setYear("");
    setSize("");
    setDownloadUrl("");
    setQuestionsCount(10);
    setTimeLimit("10 min");
    setIsPremiumOnly(false);
    setNotifTitle("");
    setNotifContent("");
    setNotifType("info");
    setUpdateTitle("");
    setUpdateContent("");
    setUpdateType("feature");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (activeTab === "note") {
        await addDoc(collection(db, "notes"), {
          subject,
          topic,
          content,
          videoUrl: videoUrl || null,
          imageUrl: imageUrl || null,
          isPremiumOnly,
          createdAt: new Date().toISOString()
        });
      } else if (activeTab === "video") {
        await addDoc(collection(db, "videos"), {
          title,
          subject,
          topic,
          videoUrl: ytUrl,
          thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${ytUrl.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`,
          isPremiumOnly,
          createdAt: new Date().toISOString()
        });
      } else if (activeTab === "link") {
        await addDoc(collection(db, "resources"), {
          title,
          url: resUrl,
          category: resCategory,
          isPremium: isPremiumOnly,
          viewCount: 0,
          createdAt: new Date().toISOString()
        });
      } else if (activeTab === "paper") {
        await addDoc(collection(db, "papers"), {
          subject,
          year,
          level,
          size,
          downloadUrl,
          isPremiumOnly,
          createdAt: new Date().toISOString()
        });
      } else if (activeTab === "quiz") {
        await addDoc(collection(db, "quizzes"), {
          subject,
          topic,
          questionsCount: Number(questionsCount),
          timeLimit,
          color,
          isPremiumOnly,
          createdAt: new Date().toISOString()
        });
      } else if (activeTab === "notification") {
        await addDoc(collection(db, "announcements"), {
          title: notifTitle,
          content: notifContent,
          type: notifType,
          active: true,
          createdAt: new Date().toISOString()
        });
      } else if (activeTab === "whats_new") {
        await addDoc(collection(db, "changelog"), {
          title: updateTitle,
          content: updateContent,
          type: updateType,
          createdAt: new Date().toISOString()
        });
      }
      setSuccessMsg(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')} added successfully!`);
      resetForm();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, activeTab);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await seedInitialData();
      setSuccessMsg("Initial data seeded successfully!");
    } catch (err: any) {
      console.error("Error seeding data:", err);
      setErrorMsg("Failed to seed data: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleSeedLeaderboard = async () => {
    setSeedingLeaderboard(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await seedLeaderboard();
      setSuccessMsg("Leaderboard seeded with mock students!");
    } catch (err: any) {
      console.error("Error seeding leaderboard:", err);
      setErrorMsg("Failed to seed leaderboard: " + err.message);
    } finally {
      setSeedingLeaderboard(false);
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <div className="border-b border-slate-200 pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Content Management</h2>
          <p className="text-slate-500 mt-1">Add new educational resources to the platform.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            {seeding ? <Loader2 className="animate-spin" size={12} /> : <Database size={12} />}
            Seed Data
          </button>
          <button 
            onClick={handleSeedLeaderboard}
            disabled={seedingLeaderboard}
            className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-100 transition-all disabled:opacity-50 border border-amber-100"
          >
            {seedingLeaderboard ? <Loader2 className="animate-spin" size={12} /> : <Trophy size={12} />}
            Seed Leaderboard
          </button>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
        {[
          { id: "note", label: "Note", icon: FileText },
          { id: "video", label: "Video", icon: Video },
          { id: "link", label: "Link", icon: LinkIcon },
          { id: "paper", label: "Paper", icon: BookOpen },
          { id: "quiz", label: "Quiz", icon: BrainCircuit },
          { id: "notification", label: "Notif", icon: Bell },
          { id: "whats_new", label: "New", icon: Sparkles },
          { id: "users", label: "Users", icon: Users },
          { id: "staff", label: "Staff", icon: ShieldCheck },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-sm border border-emerald-200">
          <CheckCircle2 size={20} className="text-emerald-600" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-sm border border-rose-200">
          <AlertCircle size={20} className="text-rose-600" /> {errorMsg}
        </div>
      )}

      {activeTab === "users" ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="space-y-2">
            <label className={labelClass}>Search User (Email, Nickname, or UID)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                  className={`${inputClass} pl-10`}
                  placeholder="Enter email or nickname..."
                />
              </div>
              <button 
                onClick={searchUsers}
                disabled={searching}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {searching ? <Loader2 className="animate-spin" size={18} /> : "Search"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {foundUsers.length > 0 && (
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Search Results ({foundUsers.length})</p>
              </div>
            )}
            {foundUsers.map((user) => (
              <div key={user.id} className="p-5 rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 space-y-5 relative overflow-hidden group">
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xl border border-slate-200 shadow-inner">
                      {user.nickname?.[0] || user.displayName?.[0] || "?"}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight text-lg">{user.nickname || user.displayName || "No Name"}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.email}</p>
                      <p className="text-[8px] text-slate-400 font-mono mt-1 bg-slate-50 px-1.5 py-0.5 rounded inline-block">ID: {user.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {user.isPremium ? (
                      <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-amber-400/20">
                        <ShieldCheck size={12} fill="currentColor" /> PRO
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">FREE</span>
                    )}
                    {user.isBanned && (
                      <span className="bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-rose-500/20">
                        <ShieldAlert size={12} fill="currentColor" /> BANNED
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 relative z-10">
                  <button 
                    onClick={() => togglePremium(user.id, user.isPremium)}
                    disabled={loading}
                    className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
                      user.isPremium 
                      ? "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 shadow-none" 
                      : "bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-amber-400/20 active:scale-95"
                    }`}
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : (
                      <>
                        {user.isPremium ? <X size={14} /> : <Zap size={14} fill="currentColor" />}
                        {user.isPremium ? "Remove Pro" : "Make Pro"}
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => toggleBan(user.id, user.isBanned)}
                    disabled={loading}
                    className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                      user.isBanned 
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20" 
                      : "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
                    }`}
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : (
                      <>
                        {user.isBanned ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                        {user.isBanned ? "Unban User" : "Ban User"}
                      </>
                    )}
                  </button>
                </div>
                
                {/* Background Decoration */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-50 group-hover:scale-100"></div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "staff" ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="space-y-4">
            <h3 className="font-black text-slate-900">Manage Staff Profiles</h3>
            <p className="text-xs text-slate-500">Update profile picture URLs for the manager and teachers.</p>
            
            <div className="space-y-4 pt-4">
              <div>
                <label className={labelClass}>Manager Photo URL (Peter Damiano)</label>
                <input 
                  type="url" 
                  value={managerPhoto}
                  onChange={(e) => setManagerPhoto(e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className={labelClass}>Teacher 1 Photo URL</label>
                <input 
                  type="url" 
                  value={teacher1Photo}
                  onChange={(e) => setTeacher1Photo(e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className={labelClass}>Teacher 2 Photo URL</label>
                <input 
                  type="url" 
                  value={teacher2Photo}
                  onChange={(e) => setTeacher2Photo(e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
            </div>

            <button 
              onClick={updateStaff}
              disabled={loading}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4 shadow-lg shadow-slate-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Staff Profiles"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(activeTab === "video" || activeTab === "note" || activeTab === "quiz" || activeTab === "link") && (
              <div className="md:col-span-2">
                <label className={labelClass}>{activeTab === "video" || activeTab === "link" ? "Title" : "Topic"}</label>
                <input 
                  required
                  type="text" 
                  value={activeTab === "video" || activeTab === "link" ? title : topic}
                  onChange={(e) => activeTab === "video" || activeTab === "link" ? setTitle(e.target.value) : setTopic(e.target.value)}
                  className={inputClass}
                  placeholder={activeTab === "video" || activeTab === "link" ? "e.g., Introduction to Photosynthesis" : "e.g., Algebra"}
                />
              </div>
            )}
            <div>
              <label className={labelClass}>Subject</label>
              <input 
                required
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
                placeholder="e.g., Mathematics"
              />
            </div>
            {activeTab === "video" && (
              <div>
                <label className={labelClass}>Topic (Optional)</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Biology"
                />
              </div>
            )}
          </div>

          {activeTab === "video" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>YouTube URL</label>
                <input 
                  required
                  type="url" 
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className={labelClass}>Thumbnail URL (Optional)</label>
                <input 
                  type="url" 
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className={inputClass}
                  placeholder="Leave blank to auto-generate from YouTube"
                />
              </div>
            </div>
          )}

          {activeTab === "link" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Resource URL (YouTube/Drive)</label>
                <input 
                  required
                  type="url" 
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select 
                  value={resCategory}
                  onChange={(e) => setResCategory(e.target.value)}
                  className={inputClass}
                >
                  <option value="Notes">Notes</option>
                  <option value="Past Papers">Past Papers</option>
                  <option value="Videos">Videos</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "note" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Content</label>
                <textarea 
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className={inputClass}
                  placeholder="Write the study note content here..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Video URL (Optional)</label>
                  <input 
                    type="url" 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className={inputClass}
                    placeholder="YouTube link"
                  />
                </div>
                <div>
                  <label className={labelClass}>Image URL (Optional)</label>
                  <input 
                    type="url" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className={inputClass}
                    placeholder="Image link"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "paper" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Year</label>
                <input 
                  required
                  type="text" 
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 2023"
                />
              </div>
              <div>
                <label className={labelClass}>Level</label>
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={inputClass}
                >
                  <option value="MSCE">MSCE</option>
                  <option value="JCE">JCE</option>
                  <option value="PSLCE">PSLCE</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>File Size</label>
                <input 
                  required
                  type="text" 
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 2.4 MB"
                />
              </div>
              <div>
                <label className={labelClass}>Download URL</label>
                <input 
                  required
                  type="url" 
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className={inputClass}
                  placeholder="Google Drive link"
                />
              </div>
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Questions Count</label>
                <input 
                  required
                  type="number" 
                  value={questionsCount}
                  onChange={(e) => setQuestionsCount(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Time Limit</label>
                <input 
                  required
                  type="text" 
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 10 min"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Theme Color</label>
                <select 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={inputClass}
                >
                  <option value="bg-slate-600">Slate</option>
                  <option value="bg-blue-600">Blue</option>
                  <option value="bg-emerald-600">Emerald</option>
                  <option value="bg-violet-600">Violet</option>
                  <option value="bg-amber-600">Amber</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "notification" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Notification Title</label>
                <input 
                  required
                  type="text" 
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., New Past Papers Added!"
                />
              </div>
              <div>
                <label className={labelClass}>Content</label>
                <textarea 
                  required
                  value={notifContent}
                  onChange={(e) => setNotifContent(e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Write the notification message here..."
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select 
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className={inputClass}
                >
                  <option value="info">Information (Blue)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="success">Success (Emerald)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "whats_new" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Update Title</label>
                <input 
                  required
                  type="text" 
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Version 2.4: New Math Solver!"
                />
              </div>
              <div>
                <label className={labelClass}>Update Content</label>
                <textarea 
                  required
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder="Describe the new features or fixes..."
                />
              </div>
              <div>
                <label className={labelClass}>Update Type</label>
                <select 
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value)}
                  className={inputClass}
                >
                  <option value="feature">New Feature (Emerald)</option>
                  <option value="fix">Bug Fix (Blue)</option>
                  <option value="announcement">Announcement (Slate)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="isPremium" 
              checked={isPremiumOnly}
              onChange={(e) => setIsPremiumOnly(e.target.checked)}
              className="w-5 h-5 text-slate-900 rounded border-slate-300 focus:ring-slate-500"
            />
            <label htmlFor="isPremium" className="text-sm font-semibold text-slate-700">
              Premium Only Content
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4 shadow-lg shadow-slate-200"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><PlusCircle size={20} /> Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</>}
          </button>
        </form>
      )}
    </div>
  );
}
