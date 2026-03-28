"use client";
import { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Loader2, X, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export default function AIFlashcardGenerator({ onSetGenerated }: { onSetGenerated: (set: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSet = async () => {
    if (!topic) return;
    setLoading(true);
    setError("");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a set of 10 flashcards for MSCE students in Malawi on the topic: ${topic}. 
        Return the set in JSON format with fields: subject, topic, cards (array of objects with front and back).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              cards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["subject", "topic", "cards"]
          }
        }
      });

      const setText = response.text;
      if (!setText) throw new Error("No response from AI");
      const setData = JSON.parse(setText);
      
      // Save to Firestore
      const setRef = await addDoc(collection(db, "flashcardSets"), {
        subject: setData.subject,
        topic: setData.topic,
        cardsCount: setData.cards.length,
        color: "bg-blue-600",
        isPremiumOnly: false,
        isAIGenerated: true
      });

      for (const card of setData.cards) {
        await addDoc(collection(db, `flashcardSets/${setRef.id}/cards`), card);
      }

      onSetGenerated({ id: setRef.id, ...setData, color: "bg-blue-600" });
      setIsOpen(false);
      setTopic("");
    } catch (err: any) {
      console.error("Error generating flashcards:", err);
      setError("Failed to generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
      >
        <Sparkles size={20} className="animate-pulse" />
        AI Flashcard Generator
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-8 relative z-10 shadow-2xl"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
                <X size={20} />
              </button>

              <div className="text-center space-y-2 mb-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Layers size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800">AI Flashcard Generator</h3>
                <p className="text-slate-400 text-sm font-medium">Generate a study set on any topic in seconds.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Topic / Subject</label>
                  <input 
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Human Anatomy, History of Malawi..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-800"
                  />
                </div>

                {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

                <button 
                  onClick={generateSet}
                  disabled={loading || !topic}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Generating Cards...
                    </>
                  ) : (
                    <>
                      <Layers size={20} />
                      Generate & Start Study
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
