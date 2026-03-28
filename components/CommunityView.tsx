"use client";
import { Users, MessageSquare, Heart, Share2, Plus, User } from "lucide-react";

export default function CommunityView() {
  const posts = [
    { id: 1, author: "Lumbani Gondwe", time: "2h ago", content: "Does anyone have the 2023 MSCE Biology Paper 2? I'm struggling with the genetics section.", likes: 12, comments: 5 },
    { id: 2, author: "Atusaye Nyasulu", time: "5h ago", content: "Just finished the Physics quiz! Ed-Ai explained the projectile motion so well. Highly recommend!", likes: 24, comments: 2 },
    { id: 3, author: "Kondwani Mwale", time: "1d ago", content: "Good luck to everyone preparing for the mock exams next week. We can do this! 🇲🇼", likes: 45, comments: 10 },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-6 pb-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm"><Users size={24} /></div>
          <div>
            <h2 className="font-black text-xl text-slate-800 leading-tight">Community</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect with Students</p>
          </div>
        </div>
        <button className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 hover:border-blue-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{post.author}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.time}</p>
              </div>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {post.content}
            </p>
            
            <div className="flex items-center gap-6 pt-2">
              <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors">
                <Heart size={18} />
                <span className="text-xs font-bold">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors">
                <MessageSquare size={18} />
                <span className="text-xs font-bold">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="bg-slate-100 p-4 rounded-2xl flex items-center gap-3 text-slate-400 cursor-pointer hover:bg-slate-200 transition-colors">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-300">
            <Plus size={16} />
          </div>
          <span className="text-sm font-bold">Share something with the community...</span>
        </div>
      </div>
    </div>
  );
}
