"use client";
import { useState, useEffect } from "react";
import { Home, BookOpen, BrainCircuit, Crown, LogOut, UserCircle, NotebookText } from "lucide-react";
import HomeView from "@/components/HomeView";
import PapersView from "@/components/PapersView";
import QuizzesView from "@/components/QuizzesView";
import PremiumView from "@/components/PremiumView";
import AuthView from "@/components/AuthView";
import NotesView from "@/components/NotesView";
import { AnimatePresence, motion } from "motion/react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, signOut, User, isSignInWithEmailLink } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";

const INITIAL_PAPERS = [
  { subject: "Mathematics", year: "2023", level: "MSCE", size: "2.4 MB", downloadUrl: "#", isPremiumOnly: false },
  { subject: "English", year: "2023", level: "MSCE", size: "1.8 MB", downloadUrl: "#", isPremiumOnly: false },
  { subject: "Biology", year: "2022", level: "MSCE", size: "3.1 MB", downloadUrl: "#", isPremiumOnly: true },
  { subject: "Agriculture", year: "2022", level: "JCE", size: "1.5 MB", downloadUrl: "#", isPremiumOnly: false },
  { subject: "Chichewa", year: "2021", level: "MSCE", size: "1.2 MB", downloadUrl: "#", isPremiumOnly: false },
];

const INITIAL_QUIZZES = [
  { subject: "Biology", topic: "Cell Structure", questionsCount: 15, timeLimit: "10 min", color: "bg-green-500", isPremiumOnly: false },
  { subject: "Mathematics", topic: "Algebra", questionsCount: 20, timeLimit: "15 min", color: "bg-blue-500", isPremiumOnly: true },
  { subject: "English", topic: "Grammar & Syntax", questionsCount: 10, timeLimit: "5 min", color: "bg-purple-500", isPremiumOnly: false },
];

const INITIAL_NOTES = [
  { subject: "Biology", topic: "Cell Structure & Functions", content: "A cell is the basic structural, functional, and biological unit of all known organisms. A cell is the smallest unit of life.\n\nKey components:\n1. Nucleus: Contains genetic material.\n2. Mitochondria: Powerhouse of the cell.\n3. Cell Membrane: Controls what enters and exits.", isPremiumOnly: false },
  { subject: "Mathematics", topic: "Quadratic Equations", content: "A quadratic equation is any equation that can be rearranged in standard form as ax² + bx + c = 0 where x represents an unknown, and a, b, and c represent known numbers, where a ≠ 0.\n\nThe quadratic formula is: x = [-b ± √(b² - 4ac)] / 2a", isPremiumOnly: false },
  { subject: "Physics", topic: "Newton's Laws of Motion", content: "1. First Law (Inertia): An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.\n\n2. Second Law: Force equals mass times acceleration (F = ma).\n\n3. Third Law: For every action, there is an equal and opposite reaction.", isPremiumOnly: true },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if returning from an email link
    if (typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)) {
      setActiveTab("auth");
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user document exists, if not create it
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            displayName: currentUser.displayName || "Student",
            email: currentUser.email || "",
            phoneNumber: currentUser.phoneNumber || "",
            photoURL: currentUser.photoURL || "",
            isPremium: false,
            createdAt: new Date().toISOString()
          });
        }

        // Seed initial data if empty (for demo purposes)
        try {
          const papersSnap = await getDocs(collection(db, "papers"));
          if (papersSnap.empty) {
            const batch = writeBatch(db);
            INITIAL_PAPERS.forEach((paper) => {
              const ref = doc(collection(db, "papers"));
              batch.set(ref, paper);
            });
            INITIAL_QUIZZES.forEach((quiz) => {
              const ref = doc(collection(db, "quizzes"));
              batch.set(ref, quiz);
            });
            INITIAL_NOTES.forEach((note) => {
              const ref = doc(collection(db, "notes"));
              batch.set(ref, note);
            });
            await batch.commit();
            console.log("Seeded initial data");
          }
        } catch (e) {
          console.error("Error seeding data:", e);
        }
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-[100dvh] flex items-center justify-center bg-gray-50 text-blue-600 font-bold">Loading Educate MW...</div>;
  }

  const handleSignOut = () => {
    signOut(auth);
  };

  const renderView = () => {
    switch (activeTab) {
      case "home": return <HomeView onNavigate={setActiveTab} user={user} />;
      case "papers": return <PapersView />;
      case "quizzes": return <QuizzesView />;
      case "notes": return <NotesView />;
      case "premium": return <PremiumView />;
      case "auth": return <AuthView onLogin={() => setActiveTab("home")} />;
      default: return <HomeView onNavigate={setActiveTab} user={user} />;
    }
  };

  return (
    <div className="mx-auto max-w-md h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-200">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-sm z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Educate MW</h1>
        <div className="flex items-center gap-3">
          {activeTab !== "premium" && (
            <button onClick={() => setActiveTab("premium")} className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-amber-300 transition-colors">
              <Crown size={14} /> PRO
            </button>
          )}
          {user ? (
            <button onClick={handleSignOut} className="text-blue-100 hover:text-white transition-colors" title="Sign Out">
              <LogOut size={18} />
            </button>
          ) : (
            <button onClick={() => setActiveTab("auth")} className="text-sm font-bold bg-white text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-1">
              <UserCircle size={16} /> Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 pb-2 pt-1 z-20 px-1">
        <NavItem icon={<Home size={20} />} label="Home" isActive={activeTab === "home"} onClick={() => setActiveTab("home")} />
        <NavItem icon={<BookOpen size={20} />} label="Papers" isActive={activeTab === "papers"} onClick={() => setActiveTab("papers")} />
        <NavItem icon={<NotebookText size={20} />} label="Notes" isActive={activeTab === "notes"} onClick={() => setActiveTab("notes")} />
        <NavItem icon={<BrainCircuit size={20} />} label="Quizzes" isActive={activeTab === "quizzes"} onClick={() => setActiveTab("quizzes")} />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
      <div className={`${isActive ? "scale-110" : "scale-100"} transition-transform duration-200`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
