import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, BrainCircuit, User, Copy, CheckCircle, AlertCircle, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export default function AskTeacherAI({ isPremium, aiPoints }: { isPremium?: boolean, aiPoints?: number }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Muli bwanji! I'm Cleo AI, your smart teacher. I'm here to help you prepare for your MSCE, JCE, or PSLCE exams. Ask me any question related to your studies!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!isPremium && (aiPoints || 0) <= 0) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "You've run out of AI points. Refer a friend to earn more points, or upgrade to **Educate MW PRO** for unlimited access! [Upgrade Now](premium)" 
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
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: `You are a smart, expert AI Teacher for Malawian students, specializing in the Malawi National Curriculum (PSLCE, JCE, and MSCE) and MANEB examination standards. 

Your goals:
1. **Focus on Malawi:** Only provide information relevant to the Malawian curriculum. Do not use examples or curricula from outside Malawi.
2. **Simple & Memorable:** Explain concepts in a simple way that students won't forget. Use mnemonics or simple analogies.
3. **Relevant Examples:** Always provide local Malawian examples (e.g., using local names like Kondwani or Chimwemwe, places like Mount Mulanje or Lake Malawi, or situations like trading at a local market).
4. **Concise:** Keep answers short and to the point so students can grab the main idea quickly.
5. **MANEB Style:** At the end of every academic answer, include a section titled '**If asked in exams, answer like this:**' followed by a direct, concise answer that a MANEB examiner would award full marks for.
6. **Strict Academic Scope:** Do NOT answer any questions that are not related to the Malawian school syllabus (e.g., 'who is the richest man', 'how to make AI videos', celebrity gossip, etc.). 
7. **Refusal Message:** If a question is outside the study scope, you MUST politely refuse and say exactly: 'I'm your AI teacher focused on your exam not outside questions.'

Use Markdown for clear formatting.`
        }
      });
      
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Sorry, I couldn't understand that." }]);
      
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
      <div className="p-4 pb-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm"><BrainCircuit size={20} /></div>
          <div>
            <h2 className="font-bold text-lg text-slate-800 leading-tight">Cleo AI</h2>
            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Online Now</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-1.5 mb-1.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {msg.role === 'user' ? 'ME' : 'CL'}
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{msg.role === 'user' ? 'You' : 'Cleo AI'}</span>
            </div>
            
            <div className={`group relative p-4 rounded-2xl max-w-[95%] shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
              {msg.role === 'ai' ? (
                <div className="prose prose-xs prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-800 prose-strong:text-blue-600 prose-code:bg-slate-100 prose-code:p-0.5 prose-code:rounded prose-li:marker:text-blue-500">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => {
                        if (props.href === 'premium') {
                          return (
                            <button 
                              onClick={() => {
                                // We need to pass onNavigate to this component
                                // For now, let's assume it's available or use a window event
                                window.dispatchEvent(new CustomEvent('navigate', { detail: 'premium' }));
                              }}
                              className="bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] shadow-sm shadow-amber-500/20 active:scale-95 transition-all inline-flex items-center gap-1 mt-2"
                            >
                              <Zap size={10} fill="currentColor" />
                              Upgrade to PRO
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
              <div className="w-5 h-5 rounded-md bg-slate-200 text-slate-500 flex items-center justify-center text-[9px] font-bold">CL</div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cleo AI</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 text-slate-500 flex items-center gap-2.5 rounded-tl-none shadow-sm">
              <Loader2 className="animate-spin text-blue-600" size={16} /> 
              <span className="text-[10px] font-bold animate-pulse">Cleo is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-6" />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask a question..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 text-xs font-medium placeholder:text-slate-400"
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/10 active:scale-95 transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
