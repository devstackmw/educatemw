"use client";
import TermsOfServiceView from "@/components/TermsOfServiceView";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-md h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-200">
      <TermsOfServiceView onBack={() => router.push("/")} />
    </div>
  );
}
