import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Mail, Loader2, ArrowLeft, CheckCircle2, UserCircle, Phone, Lock, User, AlertCircle } from "lucide-react";

export default function AuthView({ onLogin }: { onLogin?: () => void }) {
  const [method, setMethod] = useState<"select" | "email" | "phone">("select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");

  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if returning from email link
    if (typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)) {
      let savedEmail = window.localStorage.getItem('emailForSignIn');
      if (!savedEmail) {
        savedEmail = window.prompt('Please provide your email for confirmation');
      }
      if (savedEmail) {
        setLoading(true);
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem('emailForSignIn');
            
            // Get saved profile data
            const savedName = window.localStorage.getItem('nameForSignIn') || "";
            const savedPhone = window.localStorage.getItem('phoneForSignIn') || "";
            
            await saveUserToFirestore(result.user, savedName, savedPhone);
            
            window.localStorage.removeItem('nameForSignIn');
            window.localStorage.removeItem('phoneForSignIn');
            
            if (onLogin) onLogin();
          })
          .catch((err) => {
            setError(err.message);
            setLoading(false);
          });
      }
    }
  }, [onLogin]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      const provider = new GoogleAuthProvider();
      
      if (auth.currentUser?.isAnonymous) {
        // Link anonymous account
        const result = await linkWithCredential(auth.currentUser, provider as any);
        await saveUserToFirestore(result.user, result.user.displayName || "", result.user.phoneNumber || "");
      } else {
        const result = await signInWithPopup(auth, provider);
        await saveUserToFirestore(result.user, result.user.displayName || "", result.user.phoneNumber || "");
      }
      
      if (onLogin) onLogin();
    } catch (err: any) {
      console.error("Google auth error:", err);
      if (err.code === "auth/credential-already-in-use") {
        setError("This Google account is already linked to another user. Please log in normally.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await signInAnonymously(auth);
      await saveUserToFirestore(result.user, "Guest Student", "");
      if (onLogin) onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhonePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      
      // Format phone as a pseudo-email for Firebase Auth
      // This allows phone+password login without SMS costs
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 8) {
        throw new Error("Please enter a valid phone number");
      }
      
      const pseudoEmail = `${cleanPhone}@educatemw.app`;
      
      if (authMode === "signup") {
        if (!name) throw new Error("Please enter your full name");
        
        if (auth.currentUser?.isAnonymous) {
          const credential = EmailAuthProvider.credential(pseudoEmail, password);
          const result = await linkWithCredential(auth.currentUser, credential);
          await updateProfile(result.user, { displayName: name });
          await saveUserToFirestore(result.user, name, phone);
        } else {
          const result = await createUserWithEmailAndPassword(auth, pseudoEmail, password);
          await updateProfile(result.user, { displayName: name });
          await saveUserToFirestore(result.user, name, phone);
        }
      } else {
        await signInWithEmailAndPassword(auth, pseudoEmail, password);
      }
      
      if (onLogin) onLogin();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This phone number is already registered. Try logging in.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid phone number or password.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLinkAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      
      const actionCodeSettings = {
        url: window.location.origin + window.location.pathname,
        handleCodeInApp: true,
      };
      
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      window.localStorage.setItem('emailForSignIn', email);
      window.localStorage.setItem('nameForSignIn', name);
      window.localStorage.setItem('phoneForSignIn', phone);
      
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveUserToFirestore = async (user: any, providedName: string, providedPhone: string) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || null,
          phoneNumber: providedPhone || user.phoneNumber || null,
          displayName: providedName || user.displayName || "Student",
          photoURL: user.photoURL || null,
          isPremium: false,
          createdAt: new Date().toISOString(),
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          aiPoints: 5 // Initial points
        });
      }
    } catch (err) {
      console.error("Firestore error:", err);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-full bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a sign-in link to <strong>{email}</strong>. Click the link to complete your registration.
          </p>
          
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3 text-left">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-amber-800 font-bold text-sm">Don&apos;t see the email?</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                Please check your <strong>Spam</strong> or <strong>Junk</strong> folder. Sometimes magic links land there!
              </p>
            </div>
          </div>

          <button 
            onClick={() => setEmailSent(false)}
            className="text-blue-600 font-medium hover:underline"
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-600 mb-2">Educate MW</h1>
          <p className="text-gray-500 text-sm">
            {auth.currentUser?.isAnonymous 
              ? "Link your account to save your progress permanently" 
              : "Create a student account or sign in"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        {method === "select" && (
          <div className="space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button 
              onClick={() => setMethod("phone")}
              className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-3"
            >
              <Phone size={20} />
              Phone & Password {authMode === "signup" ? "Sign Up" : "Login"}
            </button>

            <button 
              onClick={() => setMethod("email")}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
            >
              <Mail size={20} />
              Passwordless Email Sign-In
            </button>

            <button 
              onClick={handleGuestSignIn}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-600 font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
            >
              <UserCircle size={20} />
              Continue as Guest
            </button>

            <div className="pt-4 text-center">
              <button 
                onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                className="text-sm text-blue-600 font-bold hover:underline"
              >
                {authMode === "signup" ? "Already have an account? Login" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}

        {method === "phone" && (
          <form onSubmit={handlePhonePasswordAuth} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {authMode === "signup" ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-xs text-gray-500">Using your phone number and password</p>
            </div>

            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0888123456"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (authMode === "signup" ? "Create Account" : "Login")}
            </button>
            
            <button 
              type="button" 
              onClick={() => setMethod("select")} 
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 mt-4 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} /> Back to options
            </button>
          </form>
        )}

        {method === "email" && (
          <form onSubmit={handleEmailLinkAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number (No SMS Verification)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+265 888 123 456"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">We collect this for your student profile only.</p>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Magic Link"}
            </button>
            
            <button 
              type="button" 
              onClick={() => setMethod("select")} 
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 mt-4 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} /> Back to options
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
