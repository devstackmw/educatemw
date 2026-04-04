"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/firebase";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ paidStudents: 0, totalUsers: 0, totalPosts: 0 });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const usersSnap = await getCountFromServer(collection(db, "users"));
        const paidUsersSnap = await getCountFromServer(query(collection(db, "users"), where("isPremium", "==", true)));
        const postsSnap = await getCountFromServer(collection(db, "posts"));
        
        setMetrics({
          paidStudents: paidUsersSnap.data().count,
          totalUsers: usersSnap.data().count,
          totalPosts: postsSnap.data().count
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Users</p>
          <p className="text-3xl font-bold mt-2">{metrics.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Paid Students</p>
          <p className="text-3xl font-bold mt-2">{metrics.paidStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Posts</p>
          <p className="text-3xl font-bold mt-2">{metrics.totalPosts}</p>
        </div>
      </div>
    </div>
  );
}
