import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, BrainCircuit } from "lucide-react";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export default function AskTeacherAI() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hello! I'm your Ed-Ai Assistant. Ask me anything about your studies!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a helpful tutor for Malawian students. Answer the following question: ${userMessage}`,
        config: {
          systemInstruction: "You are a friendly, encouraging tutor for Malawian MSCE/JCE students. Explain concepts simply, use local Malawian examples if possible, and keep answers concise."
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
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><BrainCircuit size={24} /></div>
          <h2 className="font-black text-2xl text-slate-800">Ed-Ai Assistant</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-3xl max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 text-slate-500 flex items-center gap-2 rounded-bl-none shadow-sm">
              <Loader2 className="animate-spin" size={16} /> Teacher is thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a question..."
          className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
