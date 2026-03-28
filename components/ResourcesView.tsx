"use client";
import { Archive, FileText, Download, ExternalLink, ChevronRight, Search } from "lucide-react";

export default function ResourcesView() {
  const resources: any[] = [];

  return (
    <div className="p-6 pt-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-rose-100 text-rose-600 rounded-2xl shadow-sm"><Archive size={32} /></div>
        <div>
          <h2 className="font-black text-2xl text-slate-800">Resources</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Official Documents & Guides</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search resources..."
          className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest px-2">Official Documents</h3>
          {resources.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium">No resources uploaded yet.</p>
            </div>
          ) : resources.filter(r => r.category === "Official").map((resource) => (
            <div key={resource.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-rose-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-rose-50 p-3 rounded-2xl text-rose-600">
                  <FileText size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{resource.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{resource.type} • {resource.size}</p>
                </div>
              </div>
              <button className="p-3 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors">
                <Download size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest px-2">Study Materials</h3>
          {resources.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium">No materials uploaded yet.</p>
            </div>
          ) : resources.filter(r => r.category === "Study Material").map((resource) => (
            <div key={resource.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-rose-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-rose-50 p-3 rounded-2xl text-rose-600">
                  <FileText size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{resource.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{resource.type} • {resource.size}</p>
                </div>
              </div>
              <button className="p-3 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors">
                <Download size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-2">External Links</h3>
          <p className="text-slate-400 text-xs font-medium mb-6">Access official educational portals in Malawi.</p>
          <div className="space-y-3">
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
    <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10">
      <span className="text-sm font-bold text-white/90">{label}</span>
      <ExternalLink size={16} className="text-white/40" />
    </button>
  );
}
