'use client';
import { useEffect, useState, useMemo } from "react";
import { collection, query, where, getCountFromServer, addDoc, serverTimestamp, onSnapshot, orderBy, deleteDoc, doc, updateDoc, getDocs, limit, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Eye
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [metrics, setMetrics] = useState({ paidStudents: 0, totalUsers: 0, totalPosts: 0 });
  const [resource, setResource] = useState({ title: "", type: "Video", url: "", isPremium: false, category: "Notes" });
  const [resources, setResources] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [examDates, setExamDates] = useState<any[]>([]);
  const [dailyTip, setDailyTip] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", type: "info" });
  const [newExamDate, setNewExamDate] = useState({ subject: "", date: "" });
  const router = useRouter();

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

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/admin/login");
        return;
      }

      // Listen for resources
      const qResources = query(collection(db, "resources"), orderBy("createdAt", "desc"));
      const unsubResources = onSnapshot(qResources, (snapshot) => {
        setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // Listen for users
      const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50));
      const unsubUsers = onSnapshot(qUsers, (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

      fetchMetrics();
      
      // Cleanup
      return () => {
        unsubResources();
        unsubUsers();
        unsubTip();
        unsubAnnouncements();
        unsubExamDates();
        unsubPayments();
      };
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await addDoc(collection(db, "resources"), {
        ...resource,
        createdAt: serverTimestamp(),
      });
      setResource({ title: "", type: "Video", url: "", isPremium: false, category: "Notes" });
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Failed to add resource.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteDoc(doc(db, "resources", id));
    } catch (error) {
      console.error("Error deleting resource:", error);
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
        dailyEarnings[date] += p.amount || 0;
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
    return payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [payments]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            EducateMW <span className="text-blue-400">Admin</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarLink 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            isActive={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")} 
          />
          <SidebarLink 
            icon={<Users size={20} />} 
            label="User Management" 
            isActive={activeTab === "users"} 
            onClick={() => setActiveTab("users")} 
          />
          <SidebarLink 
            icon={<Sparkles size={20} />} 
            label="Daily Tips" 
            isActive={activeTab === "tips"} 
            onClick={() => setActiveTab("tips")} 
          />
          <SidebarLink 
            icon={<BookOpen size={20} />} 
            label="Resources" 
            isActive={activeTab === "resources"} 
            onClick={() => setActiveTab("resources")} 
          />
          <SidebarLink 
            icon={<TrendingUp size={20} />} 
            label="Revenue" 
            isActive={activeTab === "revenue"} 
            onClick={() => setActiveTab("revenue")} 
          />
          <SidebarLink 
            icon={<BarChart3 size={20} />} 
            label="Analytics" 
            isActive={activeTab === "analytics"} 
            onClick={() => setActiveTab("analytics")} 
          />
          <SidebarLink 
            icon={<Bell size={20} />} 
            label="Announcements" 
            isActive={activeTab === "announcements"} 
            onClick={() => setActiveTab("announcements")} 
          />
          <SidebarLink 
            icon={<Calendar size={20} />} 
            label="Exam Dates" 
            isActive={activeTab === "exams"} 
            onClick={() => setActiveTab("exams")} 
          />
          <SidebarLink 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={activeTab === "settings"} 
            onClick={() => setActiveTab("settings")} 
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
      <main className="flex-1 md:ml-64 p-8">
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

        {activeTab === "resources" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Plus size={24} /></div>
                <h3 className="text-xl font-bold text-slate-900">Publish New Resource</h3>
              </div>
              <form onSubmit={handleAddResource} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resource Title</label>
                  <input type="text" placeholder="e.g. Biology Cell Structure Notes" value={resource.title} onChange={(e) => setResource({...resource, title: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
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
                  <input type="url" placeholder="https://drive.google.com/..." value={resource.url} onChange={(e) => setResource({...resource, url: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" required />
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
                  {submitting ? "Publishing..." : "Publish Resource"}
                  {!submitting && <CheckCircle2 size={20} />}
                </button>
              </form>
            </section>

            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><FileText size={24} /></div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Uploads</h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[500px] space-y-3">
                {resources.map((res) => (
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
                      <button onClick={() => handleDeleteResource(res.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
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
