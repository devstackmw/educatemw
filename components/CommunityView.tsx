"use client";
import { Users, MessageSquare, Heart, Share2, Plus, User } from "lucide-react";
import { useState, useEffect } from "react";
import { CommunitySkeleton } from "./Skeleton";

export default function CommunityView() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const posts = [
    { id: 1, author: "Lumbani Gondwe", time: "2h ago", content: "Does anyone have the 2023 MSCE Biology Paper 2? I'm struggling with the genetics section.", likes: 12, comments: 5 },
    { id: 2, author: "Atusaye Nyasulu", time: "5h ago", content: "Just finished the Physics quiz! Ed-Ai explained the projectile motion so well. Highly recommend!", likes: 24, comments: 2 },
    { id: 3, author: "Kondwani Mwale", time: "1d ago", content: "Good luck to everyone preparing for the mock exams next week. We can do this! 🇲🇼", likes: 45, comments: 10 },
  ];

  if (loading) return <CommunitySkeleton />;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 pb-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm"><Users size={20} /></div>
          <div>
            <h2 className="font-black text-lg text-slate-800 leading-tight">Community</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Connect with Students</p>
          </div>
        </div>
        <button className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3 hover:border-blue-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={16} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">{post.author}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{post.time}</p>
              </div>
            </div>
            
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              {post.content}
            </p>
            
            <div className="flex items-center gap-5 pt-1">
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors">
                <Heart size={16} />
                <span className="text-[10px] font-bold">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                <MessageSquare size={16} />
                <span className="text-[10px] font-bold">{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="bg-slate-100 p-3 rounded-xl flex items-center gap-3 text-slate-400 cursor-pointer hover:bg-slate-200 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-300">
            <Plus size={14} />
          </div>
          <span className="text-xs font-bold">Share something with the community...</span>
        </div>
      </div>
    </div>
  );
}
