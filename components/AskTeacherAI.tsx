import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, BrainCircuit, User, Copy, CheckCircle, AlertCircle, Zap, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

const QUICK_QUESTIONS = [
  { subject: "English", text: "Explain the difference between a metaphor and a simile." },
  { subject: "Biology", text: "How do plants and animals adapt to dry environments?" },
  { subject: "Agriculture", text: "What are the common diseases of mushrooms in Malawi?" },
  { subject: "Mathematics", text: "How do I solve quadratic equations using the formula?" },
  { subject: "Geography", text: "Explain the formation of the Rift Valley." }
];

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Educate MW',
          text: 'Join me on Educate MW to prepare for MSCE exams!',
          url: window.location.origin,
        });
        // In a real app, we'd verify the registration. For now, we just reward the share intent.
        if (auth.currentUser) {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            aiPoints: (aiPoints || 0) + 2
          });
          setMessages(prev => [...prev, { role: 'ai', text: "Thanks for sharing! You've earned 2 AI coins." }]);
        }
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert("Sharing is not supported on this browser. Copy the link: " + window.location.origin);
    }
  };

  const sendMessage = async (textOverride?: string) => {
    const messageToSend = textOverride || input;
    if (!messageToSend.trim()) return;

    if (!isPremium && (aiPoints || 0) <= 0) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "### 🚀 You've run out of AI points!\n\nWill you pay K5000 to access me without limit, or will you invite friends and earn coins?\n\n[Pay K5000 for Unlimited Access](premium)\n\n[Invite Friends (1 Share = 2 Coins)](share)" 
      }]);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setApiKeyMissing(true);
      setMessages(prev => [...prev, { role: 'ai', text: "Error: Gemini API key is missing. Please configure NEXT_PUBLIC_GEMINI_API_KEY in your environment variables." }]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setInput("");
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messageToSend,
        config: {
          systemInstruction: `You are Cleo AI, a smart, expert AI Teacher for Malawian students, specializing in the Malawi National Curriculum (PSLCE, JCE, and MSCE) and MANEB examination standards. 

Your goals:
1. **Focus on Malawi:** Only provide information relevant to the Malawian curriculum.
2. **Simple English:** Respond in simple English that is easy for Malawian students to understand.
3. **Proper Formatting:** Use Markdown for clear formatting (bold, bullet points, numbered lists).
4. **Pictures:** If a user requests a picture for easy understanding, provide an image URL from verified sources (like Wikimedia Commons or Unsplash) and ensure it is strictly educational. Use markdown image syntax: ![description](url).
5. **MANEB Style:** At the end of every academic answer, include a section titled '**If asked in exams, answer like this:**' followed by a direct, concise answer that a MANEB examiner would award full marks for.
6. **Strict Academic Scope:** Do NOT answer any questions that are not related to the Malawian school syllabus.
7. **Refusal Message:** If a question is outside the study scope, you MUST politely refuse and say exactly: 'I'm your AI teacher focused on your exam not outside questions.'`
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
      <div className="p-4 pb-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm"><BrainCircuit size={20} /></div>
          <div>
            <h2 className="font-bold text-lg text-slate-800 leading-tight">Cleo AI</h2>
            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Online Now</p>
          </div>
        </div>
        {!isPremium && (
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
            <Zap size={14} className="text-amber-500" fill="currentColor" />
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">{aiPoints || 0} Coins</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q.text)}
                className="bg-white border border-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-medium shadow-sm hover:bg-blue-50 transition-colors text-left"
              >
                <span className="block font-bold text-[9px] uppercase tracking-widest text-blue-400 mb-0.5">{q.subject}</span>
                {q.text}
              </button>
            ))}
          </div>
        )}

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
                <div className="prose prose-xs prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-800 prose-strong:text-blue-600 prose-code:bg-slate-100 prose-code:p-0.5 prose-code:rounded prose-li:marker:text-blue-500 prose-img:rounded-xl prose-img:shadow-sm">
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
                              className="bg-amber-500 text-white px-3 py-2 rounded-xl font-bold text-[11px] shadow-sm shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-3 w-full"
                            >
                              <Zap size={14} fill="currentColor" />
                              Pay K5000 for Unlimited Access
                            </button>
                          );
                        }
                        if (props.href === 'share') {
                          return (
                            <button 
                              onClick={handleShare}
                              className="bg-blue-600 text-white px-3 py-2 rounded-xl font-bold text-[11px] shadow-sm shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 w-full"
                            >
                              <Share2 size={14} />
                              Invite Friends (Earn 2 Coins)
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
          onClick={() => sendMessage()}
          disabled={loading}
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/10 active:scale-95 transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
