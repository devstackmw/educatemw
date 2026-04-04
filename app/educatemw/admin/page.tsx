"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getCountFromServer, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ paidStudents: 0, totalUsers: 0, totalPosts: 0 });
  const [resource, setResource] = useState({ title: "", type: "Video", url: "" });

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

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "resources"), {
        ...resource,
        createdAt: serverTimestamp(),
      });
      setResource({ title: "", type: "Video", url: "" });
      alert("Resource added successfully!");
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Failed to add resource.");
    }
  };

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

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Add New Resource</h3>
        <form onSubmit={handleAddResource} className="space-y-4">
          <input type="text" placeholder="Title" value={resource.title} onChange={(e) => setResource({...resource, title: e.target.value})} className="w-full p-2 border rounded" required />
          <select value={resource.type} onChange={(e) => setResource({...resource, type: e.target.value})} className="w-full p-2 border rounded">
            <option>Video</option>
            <option>Picture</option>
            <option>Notes</option>
          </select>
          <input type="url" placeholder="URL" value={resource.url} onChange={(e) => setResource({...resource, url: e.target.value})} className="w-full p-2 border rounded" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Add Resource</button>
        </form>
      </div>
    </div>
  );
}
