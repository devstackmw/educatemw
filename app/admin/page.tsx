'use client';
import { useEffect, useState, useMemo } from "react";
import { collection, query, where, getCountFromServer, addDoc, serverTimestamp, onSnapshot, orderBy, deleteDoc, doc, updateDoc, getDocs, limit, setDoc, startAfter, endBefore, limitToLast } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  Users, 
  Star, 
  FileText, 
  Plus, 
  LogOut, 
  Trash2, 
  ExternalLink, 
  Video, 
  Image as ImageIcon, 
  BookOpen,
  LayoutDashboard,
  Settings,
  CheckCircle2,
  AlertCircle,
  Search,
  ShieldAlert,
  Sparkles,
  Calendar,
  BarChart3,
  Bell,
  TrendingUp,
  DollarSign,
  Eye,
  Menu,
  X,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserX
} from "lucide-react";

const AUTHORIZED_EMAILS = ["devstackmw@gmail.com", "mscepreparation@gmail.com"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [metrics, setMetrics] = useState({ paidStudents: 0, totalUsers: 0, totalPosts: 0 });
  const [resource, setResource] = useState({ title: "", subject: "", type: "Video", url: "", isPremium: false, category: "Notes" });
  const [resources, setResources] = useState<any[]>([]);
  const [resourcePage, setResourcePage] = useState(1);
  const [lastResourceDoc, setLastResourceDoc] = useState<any>(null);
  const [firstResourceDoc, setFirstResourceDoc] = useState<any>(null);
  const [hasMoreResources, setHasMoreResources] = useState(true);
  const resourcesPerPage = 10;
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [examDates, setExamDates] = useState<any[]>([]);
  const [dailyTip, setDailyTip] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceSearchTerm, setResourceSearchTerm] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", type: "info" });
  const [newExamDate, setNewExamDate] = useState({ subject: "", date: "" });
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [newQuiz, setNewQuiz] = useState({ subject: "", topic: "", questionsCount: 10, timeLimit: "10", color: "bg-blue-500", isPremiumOnly: false });
  const [newQuestions, setNewQuestions] = useState([{ text: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" }]);
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const usersSnap = await getCountFromServer(collection(db, "users"));
        const paidUsersSnap = await getCountFromServer(query(collection(db, "users"), where("isPremium", "==", true)));
        const postsSnap = await getCountFromServer(collection(db, "posts"));
        
        setMetrics({
          paidStudents: paidUsersSnap.data().count,
          totalUsers: usersSnap.data().count,
          totalPosts: postsSnap.data().count
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/admin/login");
        return;
      }

      // Verify admin status
      let adminStatus = AUTHORIZED_EMAILS.includes(user.email?.toLowerCase() || "");
      
      if (!adminStatus) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            adminStatus = true;
          }
        } catch (err) {
          console.error("Error checking admin role:", err);
        }
      }

      if (!adminStatus) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);

      // Listen for users
      const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50));
      const unsubUsers = onSnapshot(qUsers, (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }, (err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });

      // Listen for daily tip
      const unsubTip = onSnapshot(doc(db, "settings", "dailyTip"), (docSnap) => {
        if (docSnap.exists()) setDailyTip(docSnap.data().text);
      });

      // Listen for announcements
      const unsubAnnouncements = onSnapshot(query(collection(db, "announcements"), orderBy("createdAt", "desc")), (snapshot) => {
        setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // Listen for exam dates
      const unsubExamDates = onSnapshot(query(collection(db, "examDates"), orderBy("date", "asc")), (snapshot) => {
        setExamDates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // Listen for payments
      const unsubPayments = onSnapshot(query(collection(db, "payments"), orderBy("createdAt", "desc")), (snapshot) => {
        setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // Listen for quizzes
      const unsubQuizzes = onSnapshot(query(collection(db, "quizzes"), orderBy("createdAt", "desc")), (snapshot) => {
        setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      fetchMetrics();
      
      // Cleanup
      return () => {
        unsubUsers();
        unsubTip();
        unsubAnnouncements();
        unsubExamDates();
        unsubPayments();
        unsubQuizzes();
      };
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!auth.currentUser) return;

    let q = query(
      collection(db, "resources"),
      orderBy("createdAt", "desc"),
      limit(resourcesPerPage)
    );

    // This is a bit tricky with onSnapshot and pagination
    // For now, let's use a simpler approach for the admin dashboard
    // We'll use getDocs for paginated resources to avoid complex cursor management with onSnapshot
    const fetchResources = async () => {
      let qResources;
      if (resourcePage === 1) {
        qResources = query(collection(db, "resources"), orderBy("createdAt", "desc"), limit(resourcesPerPage));
      } else {
        // We'll need to handle this in the next/prev functions
        return; 
      }

      const snapshot = await getDocs(qResources);
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLastResourceDoc(snapshot.docs[snapshot.docs.length - 1]);
      setFirstResourceDoc(snapshot.docs[0]);
      setHasMoreResources(snapshot.docs.length === resourcesPerPage);
    };

    // If we want real-time for the first page only:
    if (resourcePage === 1) {
      const unsub = onSnapshot(q, (snapshot) => {
        setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLastResourceDoc(snapshot.docs[snapshot.docs.length - 1]);
        setFirstResourceDoc(snapshot.docs[0]);
        setHasMoreResources(snapshot.docs.length === resourcesPerPage);
      });
      return () => unsub();
    } else {
      // For other pages, we'll use one-time fetch or manage cursors
      // To keep it simple and functional, let's implement the handleNext/Prev logic
    }
  }, [resourcePage]);

  const handleNextResources = async () => {
    if (!lastResourceDoc || !hasMoreResources) return;
    
    const q = query(
      collection(db, "resources"),
      orderBy("createdAt", "desc"),
      startAfter(lastResourceDoc),
      limit(resourcesPerPage)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLastResourceDoc(snapshot.docs[snapshot.docs.length - 1]);
      setFirstResourceDoc(snapshot.docs[0]);
      setResourcePage(prev => prev + 1);
      setHasMoreResources(snapshot.docs.length === resourcesPerPage);
    } else {
      setHasMoreResources(false);
    }
  };

  const handlePrevResources = async () => {
    if (!firstResourceDoc || resourcePage === 1) return;
    
    const q = query(
      collection(db, "resources"),
      orderBy("createdAt", "desc"),
      endBefore(firstResourceDoc),
      limitToLast(resourcesPerPage)
    );
    
    const snapshot = await getDocs(q);
    setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLastResourceDoc(snapshot.docs[snapshot.docs.length - 1]);
    setFirstResourceDoc(snapshot.docs[0]);
    setResourcePage(prev => prev - 1);
    setHasMoreResources(true);
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "announcements"), {
        ...newAnnouncement,
        createdAt: serverTimestamp(),
      });
      setNewAnnouncement({ title: "", content: "", type: "info" });
    } catch (error) {
      console.error("Error adding announcement:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm("Delete this announcement?")) {
      try {
        await deleteDoc(doc(db, "announcements", id));
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  const handleAddExamDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamDate.subject || !newExamDate.date) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "examDates"), {
        ...newExamDate,
        createdAt: serverTimestamp(),
      });
      setNewExamDate({ subject: "", date: "" });
    } catch (error) {
      console.error("Error adding exam date:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExamDate = async (id: string) => {
    if (confirm("Delete this exam date?")) {
      try {
        await deleteDoc(doc(db, "examDates", id));
      } catch (error) {
        console.error("Error deleting exam date:", error);
      }
    }
  };

  const handleApprovePayment = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { paymentStatus: 'approved', isPremium: true });
      alert("Payment approved successfully!");
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment.");
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const resourceData = {
        ...resource,
        topic: resource.title,
        isPremiumOnly: resource.isPremium,
      };
      
      if (editingResourceId) {
        await updateDoc(doc(db, "resources", editingResourceId), {
          ...resourceData,
          updatedAt: serverTimestamp(),
        });
        setEditingResourceId(null);
        alert("Resource updated successfully!");
      } else {
        await addDoc(collection(db, "resources"), {
          ...resourceData,
          createdAt: serverTimestamp(),
        });
        
        if (resource.category === "Notes") {
          await addDoc(collection(db, "notes"), { ...resourceData, createdAt: serverTimestamp() });
        } else if (resource.category === "Videos") {
          await addDoc(collection(db, "videos"), { ...resourceData, createdAt: serverTimestamp() });
        } else if (resource.category === "Past Papers") {
          await addDoc(collection(db, "papers"), { ...resourceData, createdAt: serverTimestamp() });
        }
        alert("Resource published successfully!");
      }

      setResource({ title: "", subject: "", type: "Video", url: "", isPremium: false, category: "Notes" });
    } catch (error) {
      console.error("Error adding/updating resource:", error);
      alert("Failed to save resource.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditResource = (res: any) => {
    setResource({
      title: res.title || "",
      subject: res.subject || "",
      type: res.type || "Video",
      url: res.url || "",
      isPremium: res.isPremium || false,
      category: res.category || "Notes",
    });
    setEditingResourceId(res.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteDoc(doc(db, "resources", id));
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const quizData = {
        ...newQuiz,
        createdAt: serverTimestamp(),
      };
      
      const quizRef = await addDoc(collection(db, "quizzes"), quizData);
      
      // Add questions
      for (const question of newQuestions) {
        if (question.text && question.options.every(opt => opt !== "")) {
          await addDoc(collection(db, `quizzes/${quizRef.id}/questions`), question);
        }
      }

      setNewQuiz({ subject: "", topic: "", questionsCount: 10, timeLimit: "10", color: "bg-blue-500", isPremiumOnly: false });
      setNewQuestions([{ text: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" }]);
      alert("Quiz published successfully!");
    } catch (error) {
      console.error("Error adding quiz:", error);
      alert("Failed to add quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await deleteDoc(doc(db, "quizzes", id));
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), { isPremium: !currentStatus });
      await updateDoc(doc(db, "publicProfiles", userId), { isPremium: !currentStatus });
    } catch (error) {
      console.error("Error toggling premium:", error);
    }
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), { isBanned: !currentStatus });
      alert(currentStatus ? "User unbanned!" : "User banned!");
    } catch (error) {
      console.error("Error toggling ban:", error);
    }
  };

  const handleUpdateTip = async () => {
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "settings", "dailyTip"), { text: dailyTip });
      alert("Daily tip updated!");
    } catch (error) {
      // If it doesn't exist, create it
      try {
        const { setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "settings", "dailyTip"), { text: dailyTip });
        alert("Daily tip updated!");
      } catch (e) {
        console.error("Error updating tip:", e);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResources = useMemo(() => {
    return resources.filter(res => 
      res.title?.toLowerCase().includes(resourceSearchTerm.toLowerCase()) || 
      res.subject?.toLowerCase().includes(resourceSearchTerm.toLowerCase()) ||
      res.category?.toLowerCase().includes(resourceSearchTerm.toLowerCase())
    );
  }, [resources, resourceSearchTerm]);

  // Analytics Calculations
  const revenueData = useMemo(() => {
    const dailyEarnings: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => dailyEarnings[date] = 0);

    payments.forEach(p => {
      const date = p.createdAt?.split('T')[0];
      if (dailyEarnings[date] !== undefined) {
        dailyEarnings[date] += 5000;
      }
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      amount: dailyEarnings[date]
    }));
  }, [payments]);

  const popularityData = useMemo(() => {
    return resources
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5)
      .map(r => ({
        name: r.title.length > 20 ? r.title.substring(0, 20) + '...' : r.title,
        views: r.viewCount || 0
      }));
  }, [resources]);

  const totalEarnings = useMemo(() => {
    return payments.reduce((acc, curr) => acc + 5000, 0);
  }, [payments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-10 text-center relative z-10">
          <div className="space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-slate-800 rounded-3xl border border-slate-700 flex items-center justify-center">
                <Loader2 className="text-blue-500 animate-spin" size={48} strokeWidth={3} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Please wait loading</h2>
              <p className="text-blue-400 font-bold animate-pulse tracking-wide uppercase text-xs">Initializing Admin Dashboard...</p>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="bg-red-950/40 backdrop-blur-2xl p-12 rounded-[3rem] border-2 border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] w-full max-w-md text-center space-y-8 relative z-10"
        >
          <div className="w-28 h-28 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-500/40 animate-bounce">
            <UserX size={56} strokeWidth={3} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-red-500 tracking-tighter uppercase italic">Access Denied</h1>
            <p className="text-red-200 text-xl font-bold leading-tight">
              &quot;hoops you&apos;re fake 🤥 go away&quot;
            </p>
            <p className="text-red-400/60 text-sm font-mono">UNAUTHORIZED_ACCESS_ATTEMPT_LOGGED</p>
          </div>
          <button 
            onClick={() => {
              auth.signOut();
              router.push("/admin/login");
            }}
            className="w-full bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition-all flex items-center justify-center gap-2"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
          EducateMW <span className="text-blue-400">Admin</span>
        </h1>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 bg-slate-800 rounded-lg text-white"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed h-full z-50 transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            EducateMW <span className="text-blue-400">Admin</span>
          </h1>
          <button className="md:hidden text-slate-400" onClick={() => setIsMobileSidebarOpen(false)}>
             <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarLink 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            isActive={activeTab === "dashboard"} 
            onClick={() => { setActiveTab("dashboard"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<Users size={20} />} 
            label="User Management" 
            isActive={activeTab === "users"} 
            onClick={() => { setActiveTab("users"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<Sparkles size={20} />} 
            label="Daily Tips" 
            isActive={activeTab === "tips"} 
            onClick={() => { setActiveTab("tips"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<BookOpen size={20} />} 
            label="Resources" 
            isActive={activeTab === "resources"} 
            onClick={() => { setActiveTab("resources"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<HelpCircle size={20} />} 
            label="Quizzes" 
            isActive={activeTab === "quizzes"} 
            onClick={() => { setActiveTab("quizzes"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<TrendingUp size={20} />} 
            label="Revenue" 
            isActive={activeTab === "revenue"} 
            onClick={() => { setActiveTab("revenue"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<BarChart3 size={20} />} 
            label="Analytics" 
            isActive={activeTab === "analytics"} 
            onClick={() => { setActiveTab("analytics"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<Bell size={20} />} 
            label="Announcements" 
            isActive={activeTab === "announcements"} 
            onClick={() => { setActiveTab("announcements"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<Calendar size={20} />} 
            label="Exam Dates" 
            isActive={activeTab === "exams"} 
            onClick={() => { setActiveTab("exams"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarLink 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={activeTab === "settings"} 
            onClick={() => { setActiveTab("settings"); setIsMobileSidebarOpen(false); }} 
          />
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
        {activeTab === "revenue" && (
          <div className="space-y-8">
            <header>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Revenue & Earnings</h2>
              <p className="text-slate-500 font-medium">Track your income and payment history.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Total Revenue" 
                value={`K${totalEarnings.toLocaleString()}`} 
                icon={<DollarSign className="text-emerald-600" />} 
                color="bg-emerald-50" 
              />
              <MetricCard 
                title="Total Transactions" 
                value={payments.length} 
                icon={<TrendingUp className="text-blue-600" />} 
                color="bg-blue-50" 
              />
              <MetricCard 
                title="Avg. Transaction" 
                value={`K${payments.length ? Math.round(totalEarnings / payments.length).toLocaleString() : 0}`} 
                icon={<Star className="text-amber-600" />} 
                color="bg-amber-50" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Weekly Revenue (MWK)</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        formatter={(value: any) => [`K${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} dot={{r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Transactions</h3>
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                          <DollarSign size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">K{p.amount?.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date(p.createdAt).toLocaleDateString()} • {p.tx_ref?.substring(0, 15)}...</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase tracking-widest">Success</span>
                    </div>
                  ))}
                  {payments.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-slate-400 font-medium">No transactions yet.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            <header>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Content Analytics</h2>
              <p className="text-slate-500 font-medium">Understand what students are learning.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Most Popular Resources (Views)</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popularityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1e293b', fontSize: 11, fontWeight: 600}} width={120} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Bar dataKey="views" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={32}>
                        {popularityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Resource Breakdown</h3>
                <div className="space-y-6">
                  {resources.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 6).map((res, i) => (
                    <div key={res.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 line-clamp-1">{res.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{res.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <Eye size={14} />
                        <span className="text-xs font-black">{res.viewCount || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
        {activeTab === "announcements" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Bell size={24} /></div>
                <h3 className="text-xl font-bold text-slate-900">New Announcement</h3>
              </div>
              <form onSubmit={handleAddAnnouncement} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
                  <input type="text" placeholder="e.g. New Biology Notes Available!" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Content</label>
                  <textarea placeholder="Write the announcement details..." value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})} className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium resize-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
                  <select value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium">
                    <option value="info">Information</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50">
                  {submitting ? "Posting..." : "Post Announcement"}
                </button>
              </form>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Active Announcements</h3>
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${ann.type === 'warning' ? 'bg-rose-500' : ann.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                        <h4 className="font-bold text-slate-800 text-sm">{ann.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{ann.content}</p>
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "exams" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Calendar size={24} /></div>
                <h3 className="text-xl font-bold text-slate-900">Add Exam Date</h3>
              </div>
              <form onSubmit={handleAddExamDate} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                  <input type="text" placeholder="e.g. Biology Paper 1" value={newExamDate.subject} onChange={(e) => setNewExamDate({...newExamDate, subject: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</label>
                  <input type="date" value={newExamDate.date} onChange={(e) => setNewExamDate({...newExamDate, date: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Exam Date"}
                </button>
              </form>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Exam Schedule</h3>
              <div className="space-y-4">
                {examDates.map((exam) => (
                  <div key={exam.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl border border-slate-100 text-blue-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{exam.subject}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(exam.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteExamDate(exam.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        {activeTab === "dashboard" && (
          <>
            <header className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h2>
                <p className="text-slate-500 font-medium">Manage your educational resources and track growth.</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">System Online</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <MetricCard title="Total Users" value={metrics.totalUsers} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
              <MetricCard title="Paid Students" value={metrics.paidStudents} icon={<Star className="text-amber-600" />} color="bg-amber-50" />
              <MetricCard title="Total Posts" value={metrics.totalPosts} icon={<FileText className="text-emerald-600" />} color="bg-emerald-50" />
              <MetricCard title="Total Revenue" value={`K${totalEarnings.toLocaleString()}`} icon={<DollarSign className="text-blue-600" />} color="bg-blue-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Revenue Trend</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-sm font-medium text-slate-600">Avg. Revenue per User</span>
                    <span className="font-bold text-slate-900">K{metrics.totalUsers ? Math.round(totalEarnings / metrics.totalUsers).toLocaleString() : 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-sm font-medium text-slate-600">Conversion Rate</span>
                    <span className="font-bold text-slate-900">{metrics.totalUsers ? ((metrics.paidStudents / metrics.totalUsers) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-sm font-medium text-slate-600">Active Resources</span>
                    <span className="font-bold text-slate-900">{resources.length}</span>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === "quizzes" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><HelpCircle size={24} /></div>
                <h3 className="text-xl font-bold text-slate-900">Publish New Quiz</h3>
              </div>
              <form onSubmit={handleAddQuiz} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                    <input type="text" placeholder="e.g. Biology" value={newQuiz.subject} onChange={(e) => setNewQuiz({...newQuiz, subject: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Topic</label>
                    <input type="text" placeholder="e.g. Cell Structure" value={newQuiz.topic} onChange={(e) => setNewQuiz({...newQuiz, topic: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Questions</label>
                    <input type="number" min="1" value={newQuiz.questionsCount} onChange={(e) => setNewQuiz({...newQuiz, questionsCount: parseInt(e.target.value) || 10})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time (mins)</label>
                    <input type="text" placeholder="10" value={newQuiz.timeLimit} onChange={(e) => setNewQuiz({...newQuiz, timeLimit: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Color</label>
                    <select value={newQuiz.color} onChange={(e) => setNewQuiz({...newQuiz, color: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium">
                      <option value="bg-blue-500">Blue</option>
                      <option value="bg-emerald-500">Emerald</option>
                      <option value="bg-rose-500">Rose</option>
                      <option value="bg-indigo-500">Indigo</option>
                      <option value="bg-amber-500">Amber</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${newQuiz.isPremiumOnly ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}><Star size={18} fill={newQuiz.isPremiumOnly ? "currentColor" : "none"} /></div>
                    <div><p className="text-sm font-bold text-slate-800">Premium Content</p><p className="text-[10px] text-slate-500 font-medium">Only PRO students can access this.</p></div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={newQuiz.isPremiumOnly} onChange={(e) => setNewQuiz({...newQuiz, isPremiumOnly: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800">Questions</h4>
                    <button 
                      type="button" 
                      onClick={() => setNewQuestions([...newQuestions, { text: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" }])}
                      className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      + Add Question
                    </button>
                  </div>
                  
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                    {newQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                        {newQuestions.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => setNewQuestions(newQuestions.filter((_, i) => i !== qIdx))}
                            className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Question {qIdx + 1}</label>
                          <textarea 
                            placeholder="Enter question text..." 
                            value={q.text} 
                            onChange={(e) => {
                              const updated = [...newQuestions];
                              updated[qIdx].text = e.target.value;
                              setNewQuestions(updated);
                            }} 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-medium text-sm resize-none h-20" 
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Options</label>
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name={`correct-${qIdx}`} 
                                checked={q.correctAnswerIndex === optIdx}
                                onChange={() => {
                                  const updated = [...newQuestions];
                                  updated[qIdx].correctAnswerIndex = optIdx;
                                  setNewQuestions(updated);
                                }}
                                className="w-4 h-4 text-blue-600"
                              />
                              <input 
                                type="text" 
                                placeholder={`Option ${optIdx + 1}`} 
                                value={opt} 
                                onChange={(e) => {
                                  const updated = [...newQuestions];
                                  updated[qIdx].options[optIdx] = e.target.value;
                                  setNewQuestions(updated);
                                }} 
                                className="flex-1 p-2 bg-white border border-slate-200 rounded-lg outline-none text-sm" 
                                required 
                              />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Explanation (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="Why is this correct?" 
                            value={q.explanation || ""} 
                            onChange={(e) => {
                              const updated = [...newQuestions];
                              updated[qIdx].explanation = e.target.value;
                              setNewQuestions(updated);
                            }} 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-medium text-sm" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={submitting || newQuestions.length === 0} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? "Publishing..." : "Publish Quiz"}
                  {!submitting && <CheckCircle2 size={20} />}
                </button>
              </form>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><HelpCircle size={24} /></div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Quizzes</h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[800px] space-y-3">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${quiz.isPremiumOnly ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 border border-slate-100'}`}>
                        <HelpCircle size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{quiz.topic}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{quiz.subject} • {quiz.questionsCount} Qs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                {quizzes.length === 0 && (
                  <div className="text-center p-8 text-slate-500 font-medium">
                    No quizzes found.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Plus size={24} /></div>
                <h3 className="text-xl font-bold text-slate-900">{editingResourceId ? "Edit Resource" : "Publish New Resource"}</h3>
                {editingResourceId && (
                  <button 
                    onClick={() => {
                      setEditingResourceId(null);
                      setResource({ title: "", subject: "", type: "Video", url: "", isPremium: false, category: "Notes" });
                    }}
                    className="ml-auto text-sm text-slate-500 hover:text-slate-700"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleAddResource} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resource Title</label>
                  <input type="text" placeholder="e.g. Cell Structure Notes" value={resource.title} onChange={(e) => setResource({...resource, title: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                  <input type="text" placeholder="e.g. Biology" value={resource.subject} onChange={(e) => setResource({...resource, subject: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
                    <select value={resource.type} onChange={(e) => setResource({...resource, type: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium">
                      <option>Video</option><option>Picture</option><option>Notes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Destination</label>
                    <select value={resource.category} onChange={(e) => setResource({...resource, category: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium">
                      <option>Notes</option><option>Past Papers</option><option>Videos</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resource URL</label>
                  <input type="url" placeholder={resource.category === "Videos" ? "https://youtube.com/watch?v=..." : "https://drive.google.com/..."} value={resource.url} onChange={(e) => setResource({...resource, url: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${resource.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}><Star size={18} fill={resource.isPremium ? "currentColor" : "none"} /></div>
                    <div><p className="text-sm font-bold text-slate-800">Premium Content</p><p className="text-[10px] text-slate-500 font-medium">Only PRO students can access this.</p></div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={resource.isPremium} onChange={(e) => setResource({...resource, isPremium: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? "Saving..." : (editingResourceId ? "Update Resource" : "Publish Resource")}
                  {!submitting && <CheckCircle2 size={20} />}
                </button>
              </form>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><FileText size={24} /></div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Uploads</h3>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search resources..." 
                    value={resourceSearchTerm}
                    onChange={(e) => setResourceSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[500px] space-y-3">
                {filteredResources.map((res) => (
                  <div key={res.id} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${res.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 border border-slate-100'}`}>
                        {res.type === "Video" ? <Video size={18} /> : res.type === "Picture" ? <ImageIcon size={18} /> : <BookOpen size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{res.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600"><ExternalLink size={18} /></a>
                      <button onClick={() => handleEditResource(res)} className="p-2 text-slate-400 hover:text-blue-600"><Settings size={18} /></button>
                      <button onClick={() => handleDeleteResource(res.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                {filteredResources.length === 0 && (
                  <div className="text-center p-8 text-slate-500 font-medium">
                    No resources found.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {resourcePage}</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrevResources} 
                    disabled={resourcePage === 1}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
                    title="Previous Page"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={handleNextResources} 
                    disabled={!hasMoreResources}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
                    title="Next Page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "users" && (
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h2>
                <p className="text-slate-500 font-medium">Manage student accounts and premium access.</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Payment</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold overflow-hidden relative">
                            {u.photoURL ? <Image src={u.photoURL} alt="" fill className="object-cover" referrerPolicy="no-referrer" /> : u.displayName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{u.displayName}</p>
                            <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        {u.isPremium ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <Star size={10} fill="currentColor" />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {u.paymentStatus === 'pending' ? (
                          <button 
                            onClick={() => handleApprovePayment(u.id)}
                            className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-200 transition-all"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-500 capitalize">{u.paymentStatus || 'N/A'}</span>
                        )}
                      </td>
                      <td className="py-4 text-xs font-medium text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => togglePremium(u.id, u.isPremium)}
                            className={`p-2 rounded-lg transition-all ${u.isPremium ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                            title={u.isPremium ? "Revoke Premium" : "Grant Premium"}
                          >
                            <Star size={18} fill={u.isPremium ? "currentColor" : "none"} />
                          </button>
                          <button 
                            onClick={() => toggleBan(u.id, u.isBanned)}
                            className={`p-2 rounded-lg transition-all ${u.isBanned ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`} 
                            title={u.isBanned ? "Unban User" : "Ban User"}
                          >
                            <ShieldAlert size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8">
            <header>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h2>
              <p className="text-slate-500 font-medium">Configure app-wide parameters.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Premium Pricing</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Standard Price (MWK)</label>
                    <input type="number" defaultValue={5000} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" />
                  </div>
                  <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all">
                    Save Pricing
                  </button>
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Maintenance Mode</h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Enable Maintenance</p>
                    <p className="text-[10px] text-slate-500 font-medium">Students won&apos;t be able to access the app.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-rose-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "tips" && (
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Sparkles size={24} /></div>
              <h3 className="text-xl font-bold text-slate-900">Daily Tip Manager</h3>
            </div>
            <p className="text-slate-500 mb-6 font-medium">This tip appears on the home screen for all students. Keep it educational and inspiring!</p>
            
            <div className="space-y-4">
              <textarea 
                value={dailyTip}
                onChange={(e) => setDailyTip(e.target.value)}
                placeholder="Enter today's educational tip..."
                className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800 resize-none"
              />
              <button 
                onClick={handleUpdateTip}
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update Daily Tip"}
                <CheckCircle2 size={20} />
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
        isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
        : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MetricCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
      <div className={`p-4 ${color} rounded-2xl`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
