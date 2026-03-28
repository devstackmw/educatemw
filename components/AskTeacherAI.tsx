import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, BrainCircuit, User, Copy, CheckCircle, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AskTeacherAI() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hello! I'm your Ed-Ai Assistant. Ask me anything about your studies!" }
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
        contents: `You are a helpful tutor for Malawian students. Answer the following question: ${userMessage}`,
        config: {
          systemInstruction: "You are a friendly, encouraging tutor for Malawian MSCE/JCE students. Explain concepts simply, use local Malawian examples if possible, and keep answers concise. Use markdown for formatting (bold, lists, tables, etc.) to make it easy to read. If you provide code, use code blocks."
        }
      });
      
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Sorry, I couldn't understand that." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to the teacher right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-6 pb-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm"><BrainCircuit size={24} /></div>
          <div>
            <h2 className="font-black text-xl text-slate-800 leading-tight">Ed-Ai Assistant</h2>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online Now</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {msg.role === 'user' ? 'ME' : 'AI'}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.role === 'user' ? 'You' : 'Ed-Ai'}</span>
            </div>
            
            <div className={`group relative p-5 rounded-3xl max-w-[95%] shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
              {msg.role === 'ai' ? (
                <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-black prose-headings:text-slate-800 prose-strong:text-blue-600 prose-code:bg-slate-100 prose-code:p-1 prose-code:rounded-md prose-li:marker:text-blue-500">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
              )}

              {msg.role === 'ai' && (
                <button 
                  onClick={() => handleCopy(msg.text, idx)}
                  className="absolute -bottom-10 left-0 p-2 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  {copiedIndex === idx ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-black">AI</div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ed-Ai</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 text-slate-500 flex items-center gap-3 rounded-tl-none shadow-sm">
              <Loader2 className="animate-spin text-blue-600" size={18} /> 
              <span className="text-xs font-bold animate-pulse">Teacher is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-10" />
      </div>

      <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask a question..."
          className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 text-sm font-medium placeholder:text-slate-400"
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
