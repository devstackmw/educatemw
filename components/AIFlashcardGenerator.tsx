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
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
      >
        <Sparkles size={18} className="animate-pulse" />
        AI Flashcard Generator
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="bg-white w-full max-w-sm rounded-xl p-6 relative z-10 shadow-2xl"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg">
                <X size={18} />
              </button>

              <div className="text-center space-y-1 mb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Layers size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">AI Flashcard Generator</h3>
                <p className="text-slate-400 text-xs font-medium">Generate a study set on any topic in seconds.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Topic / Subject</label>
                  <input 
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Human Anatomy, History..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-800 text-sm"
                  />
                </div>

                {error && <p className="text-rose-500 text-[10px] font-bold text-center">{error}</p>}

                <button 
                  onClick={generateSet}
                  disabled={loading || !topic}
                  className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Generating Cards...
                    </>
                  ) : (
                    <>
                      <Layers size={18} />
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
