"use client";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { Video, Play, Search, Zap, Clock } from "lucide-react";
import Image from "next/image";

export default function VideosView({ isPremium }: { isPremium?: boolean }) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVideos(videoData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error in VideosView:", error);
      // Optional: handleFirestoreError(error, 'get', 'videos') if defined
    });
    return () => unsubscribe();
  }, []);

  const subjects = ["All", ...Array.from(new Set(videos.map(v => v.subject)))];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         video.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || video.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';
    
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      return url; // Already an embed URL
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const getThumbnailUrl = (url: string, fallback: string) => {
    if (!url) return fallback;
    let videoId = '';
    
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    }
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return fallback || "https://picsum.photos/seed/video/640/360";
  };

  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  return (
    <div className="p-4 pt-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm"><Video size={24} /></div>
        <div>
          <h2 className="font-black text-xl text-slate-800">Video Lessons</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learn from expert teachers</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search videos or subjects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                selectedSubject === subject 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "bg-white text-slate-500 border border-slate-100"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
              <div className="aspect-video bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Video size={32} />
          </div>
          <p className="text-slate-500 font-medium text-sm">No videos found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
              <div className="relative aspect-video bg-slate-900">
                {playingVideoId === video.id ? (
                  <iframe 
                    src={`${getEmbedUrl(video.url || video.videoUrl)}?autoplay=1&rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  ></iframe>
                ) : (
                  <>
                    <Image 
                      src={getThumbnailUrl(video.url || video.videoUrl, video.thumbnailUrl)} 
                      alt={video.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div 
                      className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        if (video.isPremiumOnly && !isPremium) {
                          window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
                        } else {
                          setPlayingVideoId(video.id);
                        }
                      }}
                    >
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-blue-600 shadow-xl transform group-hover:scale-110 transition-all">
                        <Play size={24} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                    {video.isPremiumOnly && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-lg text-[8px] font-black flex items-center gap-1 shadow-lg">
                        <Zap size={8} fill="currentColor" /> PRO
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">{video.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                    {video.subject}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {video.topic}
                  </span>
                </div>
                
                {video.isPremiumOnly && !isPremium ? (
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }))}
                    className="w-full mt-2 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={12} fill="currentColor" /> Unlock with PRO
                  </button>
                ) : playingVideoId !== video.id ? (
                  <button 
                    onClick={() => setPlayingVideoId(video.id)}
                    className="w-full mt-2 bg-blue-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                  >
                    Watch Now
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
