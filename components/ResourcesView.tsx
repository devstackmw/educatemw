"use client";
import { Archive, FileText, Download, ExternalLink, ChevronRight, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { ResourcesSkeleton } from "./Skeleton";

export default function ResourcesView() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const resources: any[] = [];

  if (loading) return <ResourcesSkeleton />;

  return (
    <div className="p-4 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shadow-sm"><Archive size={24} /></div>
        <div>
          <h2 className="font-black text-xl text-slate-800">Resources</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Documents & Guides</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search resources..."
          className="w-full bg-white border border-slate-100 rounded-lg py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
        />
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest px-1">Official Documents</h3>
          {resources.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-xs font-medium">No resources uploaded yet.</p>
            </div>
          ) : resources.filter(r => r.category === "Official").map((resource) => (
            <div key={resource.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-rose-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-rose-50 p-2 rounded-lg text-rose-600">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{resource.title}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{resource.type} • {resource.size}</p>
                </div>
              </div>
              <button className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                <Download size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest px-1">Study Materials</h3>
          {resources.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-xs font-medium">No materials uploaded yet.</p>
            </div>
          ) : resources.filter(r => r.category === "Study Material").map((resource) => (
            <div key={resource.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-rose-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-rose-50 p-2 rounded-lg text-rose-600">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{resource.title}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{resource.type} • {resource.size}</p>
                </div>
              </div>
              <button className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                <Download size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-xl text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
        <div className="relative z-10">
          <h3 className="text-lg font-black mb-1.5">External Links</h3>
          <p className="text-slate-400 text-[10px] font-medium mb-4">Access official educational portals in Malawi.</p>
          <div className="space-y-2">
            <ExternalLinkItem label="MANEB Official Portal" />
            <ExternalLinkItem label="Ministry of Education" />
            <ExternalLinkItem label="Malawi Institute of Education" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExternalLinkItem({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
      <span className="text-xs font-bold text-white/90">{label}</span>
      <ExternalLink size={14} className="text-white/40" />
    </button>
  );
}
