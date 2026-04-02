"use client";
import { Users, MessageSquare, Heart, Share2, Plus, User, Send, X, Trash2, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { CommunitySkeleton } from "./Skeleton";
import { db, auth } from "@/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  updateDoc, 
  increment, 
  deleteDoc,
  Timestamp
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

import { AVATARS } from "@/lib/avatars";

interface Post {
  id: string;
  uid: string;
  authorName: string;
  authorPhoto?: string;
  authorAvatarId?: string;
  content: string;
  likes: number;
  commentsCount: number;
  createdAt: any;
}

export default function CommunityView({ isPremium, onNavigate }: { isPremium?: boolean, onNavigate?: (tab: string) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Increased limit to 50 since we're restricting to premium users (lower write volume)
    const q = query(
      collection(db, "posts"), 
      orderBy("createdAt", "desc"), 
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Community Snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async () => {
    if (!isPremium) {
      alert("Join your friends in premium to start sharing ideas and tips in the app, ask questions to AI, or ask community!");
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
      return;
    }
    if (!newPostContent.trim() || !auth.currentUser) return;
    
    setSubmitting(true);
    // Fetch user profile for avatar
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    try {
      await addDoc(collection(db, "posts"), {
        uid: auth.currentUser.uid,
        authorName: userData.nickname || userData.realName || auth.currentUser.displayName || "Student",
        authorPhoto: userData.photoURL || auth.currentUser.photoURL || "",
        authorAvatarId: userData.avatarId || "girl_1",
        content: newPostContent.trim(),
        likes: 0,
        commentsCount: 0,
        createdAt: serverTimestamp()
      });
      setNewPostContent("");
      setIsPosting(false);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) return <CommunitySkeleton />;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="p-4 pb-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm"><Users size={20} /></div>
          <div>
            <h2 className="font-black text-lg text-slate-800 leading-tight">Community</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Connect with Students</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (isPremium) {
              setIsPosting(true);
            } else {
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
            }
          }}
          className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
        >
          {!isPremium && <Zap size={14} fill="currentColor" className="text-amber-400" />}
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
              <MessageSquare size={32} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">No posts yet</h3>
              <p className="text-slate-500 text-xs max-w-[200px]">Be the first to share something with the community!</p>
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3 hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400 overflow-hidden relative">
                    {post.authorPhoto ? (
                      <Image 
                        src={post.authorPhoto} 
                        alt="" 
                        fill 
                        className="object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full p-1">
                        {AVATARS.find(a => a.id === post.authorAvatarId)?.svg || <User size={16} />}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{post.authorName}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatTime(post.createdAt)}</p>
                  </div>
                </div>
                {auth.currentUser?.uid === post.uid && (
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              <p className="text-slate-600 text-xs leading-relaxed font-medium whitespace-pre-wrap">
                {post.content}
              </p>
              
              <div className="flex items-center gap-5 pt-1">
                <button 
                  onClick={() => handleLike(post.id, post.likes)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors group"
                >
                  <Heart size={16} className="group-active:scale-125 transition-transform" />
                  <span className="text-[10px] font-bold">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                  <MessageSquare size={16} />
                  <span className="text-[10px] font-bold">{post.commentsCount}</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors ml-auto">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0">
        <div 
          onClick={() => {
            if (isPremium) {
              setIsPosting(true);
            } else {
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
            }
          }}
          className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
            isPremium ? "bg-slate-100 text-slate-400 hover:bg-slate-200" : "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 text-amber-700"
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isPremium ? "bg-white text-slate-300" : "bg-amber-500 text-white"}`}>
            {isPremium ? <Plus size={14} /> : <Zap size={14} fill="currentColor" />}
          </div>
          <span className="text-xs font-bold">
            {isPremium ? "Share something with the community..." : "Join PRO to start sharing ideas and tips"}
          </span>
        </div>
      </div>

      {/* Posting Modal */}
      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-t-[2rem] sm:rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg text-slate-800">Create Post</h3>
                <button 
                  onClick={() => setIsPosting(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind? Ask a question or share a study tip..."
                className="w-full h-32 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <button 
                onClick={handleCreatePost}
                disabled={submitting || !newPostContent.trim()}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Post to Community
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
