"use client";
import { Archive, ExternalLink, Search } from "lucide-react";
import { useState } from "react";

export default function ResourcesView() {
  const officialLinks = [
    { title: "NCHE Official Portal", description: "Download PDF lists of selected students for universities.", url: "https://nche.ac.mw/" },
    { title: "University Application", description: "Apply for university admission online.", url: "https://apply.ac.mw/" },
    { title: "MANEB Official Page", description: "Check if exams are marked and official announcements.", url: "https://maneb.edu.mw/" },
    { title: "MANEB Results Portal", description: "View your official exam points and results.", url: "https://results.maneb.edu.mw/" },
  ];

  return (
    <div className="p-4 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shadow-sm"><Archive size={24} /></div>
        <div>
          <h2 className="font-black text-xl text-slate-800">Resources</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Malawian Educational Portals</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest px-1">Official Portals</h3>
        {officialLinks.map((link, idx) => (
          <a 
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-rose-200 transition-all block"
          >
            <div className="flex-1 mr-4">
              <h4 className="font-bold text-slate-800 text-xs">{link.title}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{link.description}</p>
            </div>
            <ExternalLink size={16} className="text-rose-400 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
