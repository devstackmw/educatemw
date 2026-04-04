import { auth } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ADMIN_EMAILS = ["devstackmw@gmail.com"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        router.push("/");
        return;
      }
      setIsAdmin(true);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">EducateMW Admin</h1>
        <button onClick={handleSignOut} className="text-sm font-medium text-red-600 hover:text-red-700">Sign Out</button>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
