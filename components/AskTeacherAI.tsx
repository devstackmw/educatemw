import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, BrainCircuit, User, Copy, CheckCircle, AlertCircle, Zap, Search, Globe, Sparkles, Image as ImageIcon, X, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import Image from "next/image";

export default function AskTeacherAI({ isPremium, aiPoints }: { isPremium?: boolean, aiPoints?: number }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, sources?: any[], image?: string }[]>([
    { role: 'ai', text: "Muli bwanji! I'm Cleo AI, your smart teacher. I'm here to help you prepare for your MSCE, JCE, or PSLCE exams. Ask me any question related to your studies!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRELOAD_QUESTIONS = [
    "How is acid rain formed? (Biology)",
    "Blood flow in the human heart (Biology)",
    "How to solve quadratic equations? (Math)",
    "Electromotive forces (Physics)",
    "Causes of the Chilembwe Uprising 1915 (History)"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreloadClick = (question: string) => {
    const cleanQuestion = question.split(' (')[0];
    setInput(cleanQuestion);
    setTimeout(() => {
      const sendBtn = document.getElementById('ai-send-btn');
      sendBtn?.click();
    }, 100);
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    if (!isPremium && (aiPoints || 0) <= 0) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "### 🚀 You've run out of AI points!\n\nTo continue learning with **Cleo AI**, you can:\n\n1. **Upgrade to PRO**: Get unlimited questions, offline downloads, and more for just K100/month.\n2. **Refer a Friend**: Earn more points by inviting your classmates!\n\n[Upgrade to PRO Now](premium) [Refer a Friend](referral)" 
      }]);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setApiKeyMissing(true);
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Gemini API key is missing. Please configure NEXT_PUBLIC_GEMINI_API_KEY in your environment variables." }]);
      return;
    }

    const userMessage = input;
    const userImage = selectedImage;
    setMessages(prev => [...prev, { role: 'user', text: userMessage, image: userImage || undefined }]);
    setInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const config: any = {
        systemInstruction: `You are a smart, expert AI Teacher for Malawian students, specializing in the Malawi National Curriculum (PSLCE, JCE, and MSCE) and MANEB examination standards. 

Your goals:
1. **Focus on Malawi:** Only provide information relevant to the Malawian curriculum. Do not use examples or curricula from outside Malawi.
2. **Simple & Memorable:** Explain concepts in a simple way that students won't forget. Use mnemonics or simple analogies.
3. **Relevant Examples:** Always provide local Malawian examples (e.g., using local names like Kondwani or Chimwemwe, places like Mount Mulanje or Lake Malawi, or situations like trading at a local market).
4. **Concise:** Keep answers short and to the point so students can grab the main idea quickly.
5. **MANEB Style:** At the end of every academic answer, include a section titled '**If asked in exams, answer like this:**' followed by a direct, concise answer that a MANEB examiner would award full marks for.
6. **Strict Academic Scope:** Do NOT answer any questions that are not related to the Malawian school syllabus (e.g., 'who is the richest man', 'how to make AI videos', celebrity gossip, etc.). 
7. **Refusal Message:** If a question is outside the study scope, you MUST politely refuse and say exactly: 'I'm your AI teacher focused on your exam not outside questions.'
8. **Math Display:** When solving math, DO NOT use '$' symbols. Instead, use clear, bold, and indented steps. Align each step vertically like a real teacher writing on a chalkboard. Use 'Step 1:', 'Step 2:', etc.
9. **Image Analysis:** If an image is provided, analyze it carefully (e.g., a math problem, a diagram, or a page from a textbook) and provide a detailed explanation or solution based on the Malawian syllabus.
${useSearch ? "10. **Search Context:** You have access to Google Search. Use it to find the most accurate and up-to-date information specifically for Malawi's educational context." : ""}

Use Markdown for clear formatting.`
      };

      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const contents: any[] = [];
      if (userImage) {
        contents.push({
          inlineData: {
            data: userImage.split(',')[1],
            mimeType: "image/jpeg"
          }
        });
      }
      contents.push({ text: useSearch ? `Search specifically for Malawi context: ${userMessage}` : userMessage || "Analyze this image for me." });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: contents },
        config: config
      });
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean);

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.text || "Sorry, I couldn't understand that.",
        sources: sources
      }]);
      
      if (!isPremium) {
        if (auth.currentUser) {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            aiPoints: (aiPoints || 0) - 1
          });
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to the teacher right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 pb-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-800 leading-tight tracking-tight">Cleo AI</h2>
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Online Now</p>
              {!isPremium && (
                <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                  <Zap size={8} className="text-blue-600" fill="currentColor" />
                  <span className="text-[8px] font-black text-blue-700 uppercase tracking-tighter">{aiPoints || 0} Points Left</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setUseSearch(!useSearch)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
            useSearch 
            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20' 
            : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
          }`}
        >
          <Globe size={14} className={useSearch ? 'animate-spin-slow' : ''} />
          <span className="text-[10px] font-black uppercase tracking-widest">{useSearch ? 'Search ON' : 'Search OFF'}</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-1.5 mb-1.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white'}`}>
                {msg.role === 'user' ? 'ME' : <Sparkles size={10} />}
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{msg.role === 'user' ? 'You' : 'Cleo AI'}</span>
            </div>
            
            <div className={`group relative p-4 rounded-2xl max-w-[95%] shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
              {msg.image && (
                <div className="mb-3 relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
                  <Image src={msg.image} alt="User Upload" fill className="object-cover" />
                </div>
              )}
              {msg.role === 'ai' ? (
                <div className="space-y-4">
                  <div className="prose prose-xs prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-800 prose-strong:text-blue-600 prose-code:bg-slate-100 prose-code:p-0.5 prose-code:rounded prose-li:marker:text-blue-500">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => {
                          if (props.href === 'premium') {
                            return (
                              <button 
                                onClick={() => {
                                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
                                }}
                                className="bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] shadow-sm shadow-amber-500/20 active:scale-95 transition-all inline-flex items-center gap-1 mt-2 mr-2"
                              >
                                <Zap size={10} fill="currentColor" />
                                Upgrade to PRO
                              </button>
                            );
                          }
                          if (props.href === 'referral') {
                            return (
                              <button 
                                onClick={() => {
                                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'referral' }));
                                }}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] shadow-sm shadow-blue-600/20 active:scale-95 transition-all inline-flex items-center gap-1 mt-2"
                              >
                                <User size={10} />
                                Refer a Friend
                              </button>
                            );
                          }
                          return <a {...props} className="text-blue-600 hover:underline" />;
                        }
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-3 border-t border-slate-50 space-y-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Search size={10} />
                        Sources found for Malawi:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, sIdx) => (
                          <a 
                            key={sIdx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors truncate max-w-[150px]"
                          >
                            {source.title || 'Source'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
              )}

              {msg.role === 'ai' && (
                <button 
                  onClick={() => handleCopy(msg.text, idx)}
                  className="absolute -bottom-8 left-0 p-1.5 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  {copiedIndex === idx ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span className="text-[9px] font-bold uppercase tracking-widest">{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center text-[9px] font-bold">
                <Sparkles size={10} />
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cleo AI</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 text-slate-500 flex items-center gap-2.5 rounded-tl-none shadow-sm">
              <Loader2 className="animate-spin text-blue-600" size={16} /> 
              <span className="text-[10px] font-bold animate-pulse">Cleo is researching...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-6" />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white space-y-4">
        {selectedImage && (
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg">
              <Image src={selectedImage} alt="Preview" fill className="object-cover" />
            </div>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}
        {messages.length <= 1 && !loading && !selectedImage && (
          <div className="flex flex-wrap gap-2">
            {PRELOAD_QUESTIONS.map((q, i) => (
              <button 
                key={i}
                onClick={() => handlePreloadClick(q)}
                className="bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all active:scale-95 border border-slate-200 hover:border-blue-200"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl border transition-all active:scale-95 relative ${
              isPremium 
              ? 'bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600' 
              : 'bg-slate-50 border-slate-100 text-slate-300'
            }`}
          >
            <ImageIcon size={18} />
            {!isPremium && (
              <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full shadow-sm">
                <Lock size={8} />
              </div>
            )}
          </button>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={useSearch ? "Search Malawi context..." : "Ask a question..."}
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 text-xs font-medium placeholder:text-slate-400"
          />
          <button 
            id="ai-send-btn"
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/10 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
