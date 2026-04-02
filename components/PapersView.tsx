import { Download, Search, FileText } from "lucide-react";
import { useState } from "react";

export default function PapersView() {
  const [searchQuery, setSearchQuery] = useState("");

  const notes = [
    { title: "Chemistry Notes", url: "https://drive.google.com/drive/folders/1oqBNZAKDbPm3Wv1K1CyzOIWSXclzM-YZ", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { title: "Biology Notes", url: "https://drive.google.com/drive/folders/1IPDdImZt98qhBe-dZwTJK-JLXIvQ3gKs", color: "bg-rose-50 text-rose-600 border-rose-100" },
    { title: "Mathematics Notes", url: "https://drive.google.com/drive/folders/1nAgjHKIKU1TWMMj7YCpGSG8j5WYxz5gv", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    { title: "Agriculture Notes", url: "https://drive.google.com/drive/folders/1--BbSZ9zbtiAXVKYhiaJ9FIjgl-Uxjt5", color: "bg-orange-50 text-orange-600 border-orange-100" },
    { title: "Geography Notes", url: "https://drive.google.com/drive/folders/1jj64lf2kWEAhvrhmV-SKGGrHF67H6Mxg", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { title: "Social Studies Notes", url: "https://drive.google.com/drive/folders/1gKB6neWwy_XG2mujGu07asw7FDkgtX4I", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { title: "Physics Notes", url: "https://drive.google.com/drive/folders/1OMJ_UAboIvKS7frqnfk-Bm9mbbrrAYwT", color: "bg-purple-50 text-purple-600 border-purple-100" }
  ];

  const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <button className="px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all bg-blue-900 text-white shadow-md">
          Notes
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-600/20 mb-6">
          <h3 className="font-black text-lg mb-1">Study Notes</h3>
          <p className="text-blue-100 text-xs font-medium opacity-80">Direct access to Google Drive study materials.</p>
        </div>
        
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
            <FileText className="mx-auto text-slate-300 mb-3" size={48} />
            <h3 className="text-slate-800 font-bold mb-1">No notes found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search.</p>
          </div>
        ) : (
          filteredNotes.map((note, idx) => (
            <NoteLink 
              key={idx}
              title={note.title} 
              url={note.url} 
              color={note.color}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NoteLink({ title, url, color }: { title: string, url: string, color: string }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center justify-between p-5 rounded-3xl border transition-all hover:shadow-md active:scale-[0.98] ${color}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <FileText size={22} />
        </div>
        <span className="font-black text-sm">{title}</span>
      </div>
      <Download size={20} />
    </a>
  );
}
