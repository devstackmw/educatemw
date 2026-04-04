'use client';
import { auth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/admin");
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to login. Please ensure you are using an authorized admin email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <button 
          onClick={handleLogin} 
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
