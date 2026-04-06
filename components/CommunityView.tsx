"use client";
import { Users, MessageSquare, Heart, Share2, Plus, User, Send, X, Trash2, Zap, Search, Filter, Hash, TrendingUp } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
  Timestamp,
  where
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

import { AVATARS } from "@/lib/avatars";

const SUBJECTS = [
  "General", "Biology", "Mathematics", "English", "Geography", 
  "History", "Physics", "Chemistry", "Agriculture", "Social Studies"
];

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
  category?: string;
}

export default function CommunityView({ isPremium, onNavigate }: { isPremium?: boolean, onNavigate?: (tab: string) => void }) {
  const [limitCount, setLimitCount] = useState(20);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("General");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let q = query(
      collection(db, "posts"), 
      orderBy("createdAt", "desc"), 
      limit(limitCount)
    );

    if (selectedCategory !== "All") {
      q = query(
        collection(db, "posts"),
        where("category", "==", selectedCategory),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
      setLoadingMore(false);
    }, (error) => {
      console.error("Community Snapshot error:", error);
      setLoading(false);
      setLoadingMore(false);
    });

    return () => unsubscribe();
  }, [limitCount, selectedCategory]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    return posts.filter(post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !auth.currentUser) return;
    
    setSubmitting(true);
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
        category: newPostCategory,
        likes: 0,
        commentsCount: 0,
        createdAt: serverTimestamp()
      });
      setNewPostContent("");
      setNewPostCategory("General");
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
      <div className="p-4 pb-3 bg-white border-b border-slate-100 sticky top-0 z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm"><Users size={20} /></div>
            <div>
              <h2 className="font-black text-lg text-slate-800 leading-tight">Student Forum</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Connect with Students</p>
            </div>
          </div>
          <button 
            onClick={() => setIsPosting(true)}
            className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search posts or students..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === "All" ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-100'}`}
            >
              All Topics
            </button>
            {SUBJECTS.map(sub => (
              <button 
                key={sub}
                onClick={() => setSelectedCategory(sub)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === sub ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-100'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-b border-amber-100 p-3 px-4 flex items-start gap-3">
        <Zap className="text-amber-500 shrink-0 mt-0.5" size={16} />
        <p className="text-amber-800 text-xs font-medium leading-relaxed">
          <strong>Group Rules:</strong> Only educational content is allowed here. Please keep discussions focused on MSCE preparation, study tips, and academic questions.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
              <MessageSquare size={32} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">No posts found</h3>
              <p className="text-slate-500 text-xs max-w-[200px]">Try adjusting your search or category filter.</p>
            </div>
          </div>
        ) : (
          <>
            {filteredPosts.map((post) => (
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-xs">{post.authorName}</h4>
                        {post.category && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[8px] font-black uppercase tracking-widest">
                            {post.category}
                          </span>
                        )}
                      </div>
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
            ))}
            {posts.length >= limitCount && (
              <button 
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              >
                {loadingMore ? "Loading..." : "Load More Posts"}
              </button>
            )}
          </>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0">
        <div 
          onClick={() => setIsPosting(true)}
          className="p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors bg-slate-100 text-slate-400 hover:bg-slate-200"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white text-slate-300">
            <Plus size={14} />
          </div>
          <span className="text-xs font-bold">
            Share what&apos;s on your mind...
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

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Category</p>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {SUBJECTS.map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setNewPostCategory(sub)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${newPostCategory === sub ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
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
