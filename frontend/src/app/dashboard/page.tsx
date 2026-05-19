"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1B3A5C]">
            Plan<span className="text-[#0D9488]">View</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Searches Today</p>
            <p className="text-3xl font-bold text-[#1B3A5C]">0</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Saved Properties</p>
            <p className="text-3xl font-bold text-[#1B3A5C]">0</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Active Alerts</p>
            <p className="text-3xl font-bold text-[#1B3A5C]">0</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => router.push("/search")} className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-[#0D9488] transition">
            <p className="font-medium text-gray-900">Search Address</p>
          </button>
          <button onClick={() => router.push("/ssda")} className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-[#0D9488] transition">
            <p className="font-medium text-gray-900">Major Projects</p>
          </button>
        </div>
      </div>
    </main>
  );
}
