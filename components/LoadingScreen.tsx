"use client";
import { motion } from "motion/react";
import { GraduationCap, Sparkles } from "lucide-react";

export default function LoadingScreen({ message = "Preparing your study materials..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Main Loader Container */}
        <div className="relative group">
          {/* Pulsing Outer Ring */}
          <motion.div
            className="absolute -inset-8 bg-blue-600/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Rotating Gradient Border */}
          <motion.div
            className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2.5rem] opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          {/* Icon Container */}
          <motion.div
            className="relative bg-white p-8 rounded-[2.2rem] shadow-2xl border border-slate-100 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <div className="relative">
              <GraduationCap size={56} className="text-blue-600" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 15, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={20} className="text-amber-400 fill-amber-400" />
              </motion.div>
            </div>
            
            {/* Spinning Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <motion.circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-100"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="100 300"
                className="text-blue-600"
                animate={{ strokeDashoffset: [0, -400] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="mt-16 text-center space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
              Educate <span className="text-blue-600">MW</span>
            </h2>
          </motion.div>
          
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            
            <motion.p
              className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] max-w-[200px] leading-relaxed"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {message}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Quote / Tip */}
      <motion.div
        className="absolute bottom-12 px-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-slate-300 text-[11px] font-medium italic">
          &quot;Education is the most powerful weapon which you can use to change the world.&quot;
        </p>
      </motion.div>
    </div>
  );
}
