import { motion } from "motion/react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className={`bg-slate-200 rounded-xl ${className}`}
    />
  );
}

export function HomeSkeleton() {
  return (
    <div className="p-6 pt-20 space-y-8 pb-32 animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-slate-100 rounded-[3rem] p-8 h-64 w-full" />
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-100 h-24 rounded-3xl" />
        <div className="bg-slate-100 h-24 rounded-3xl" />
      </div>
      
      {/* Path Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-32 bg-slate-100 rounded-full" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-100 h-40 rounded-3xl" />
          <div className="bg-slate-100 h-40 rounded-3xl" />
          <div className="bg-slate-100 h-32 rounded-3xl col-span-2" />
        </div>
      </div>
    </div>
  );
}

export function PapersSkeleton() {
  return (
    <div className="p-4 space-y-6 animate-pulse">
      <div className="h-12 bg-slate-100 rounded-xl w-full" />
      <div className="h-10 bg-slate-100 rounded-2xl w-32" />
      <div className="space-y-4">
        <div className="h-32 bg-slate-100 rounded-[2rem] w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-3xl w-full" />
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      <div className="h-48 bg-slate-100 rounded-[2.5rem] w-full" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-3xl w-full" />
        ))}
      </div>
    </div>
  );
}

export function QuizzesSkeleton() {
  return (
    <div className="p-4 space-y-6 animate-pulse">
      <div className="h-32 bg-slate-100 rounded-3xl w-full" />
      <div className="h-40 bg-slate-100 rounded-3xl w-full shadow-lg" />
      <div className="space-y-4">
        <div className="h-4 w-32 bg-slate-100 rounded-full" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-3xl w-full" />
        ))}
      </div>
    </div>
  );
}

export function FlashcardsSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-40 bg-slate-100 rounded-xl" />
        <div className="h-6 w-6 bg-slate-100 rounded-full" />
      </div>
      <div className="h-32 bg-slate-100 rounded-3xl w-full" />
      <div className="h-14 bg-slate-100 rounded-2xl w-full" />
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-3xl w-full" />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-6 pt-8 space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
        <div className="h-8 w-32 bg-slate-100 rounded-xl" />
      </div>
      <div className="h-80 bg-slate-100 rounded-[3rem] w-full" />
      <div className="space-y-4">
        <div className="h-4 w-40 bg-slate-100 rounded-full" />
        <div className="h-48 bg-slate-100 rounded-[3rem] w-full" />
      </div>
      <div className="space-y-4">
        <div className="h-4 w-24 bg-slate-100 rounded-full" />
        <div className="h-64 bg-slate-100 rounded-3xl w-full" />
      </div>
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="flex flex-col h-full bg-slate-50 animate-pulse">
      <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
        <div className="flex gap-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-5 w-24 bg-slate-100 rounded-lg" />
            <div className="h-3 w-32 bg-slate-100 rounded-lg" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
      </div>
      <div className="p-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem] w-full" />
        ))}
      </div>
    </div>
  );
}

export function ResourcesSkeleton() {
  return (
    <div className="p-6 pt-8 space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-8 w-32 bg-slate-100 rounded-xl" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
      </div>
      <div className="h-14 bg-slate-100 rounded-2xl w-full" />
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-4 w-32 bg-slate-100 rounded-full" />
            <div className="h-20 bg-slate-100 rounded-3xl w-full" />
            <div className="h-20 bg-slate-100 rounded-3xl w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudyPlanSkeleton() {
  return (
    <div className="p-6 pt-8 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-8 w-32 bg-slate-100 rounded-xl" />
            <div className="h-4 w-24 bg-slate-100 rounded-lg" />
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
      </div>
      <div className="h-32 bg-slate-100 rounded-[2.5rem] w-full" />
      <div className="space-y-4">
        <div className="h-4 w-24 bg-slate-100 rounded-full" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-3xl w-full" />
        ))}
      </div>
    </div>
  );
}

export function ExamDatesSkeleton() {
  return (
    <div className="p-6 pt-8 space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-8 w-40 bg-slate-100 rounded-xl" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem] w-full" />
        ))}
      </div>
    </div>
  );
}
