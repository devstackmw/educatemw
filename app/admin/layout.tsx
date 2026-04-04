'use client';
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ADMIN_EMAILS = ["devstackmw@gmail.com", "mscepreparation@gmail.com"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);
      if (pathname === "/admin/login") {
        router.push("/admin");
      }
    });
    return () => unsubscribe();
  }, [router, pathname]);

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {isAdmin && (
        <nav className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h1 className="font-bold text-lg">EducateMW Admin</h1>
        </nav>
      )}
      <main className={isAdmin ? "p-6" : ""}>{children}</main>
    </div>
  );
}
