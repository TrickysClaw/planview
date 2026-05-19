"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface DashboardData {
  welcome: string;
  stats: {
    searchesToday: number;
    savedProperties: number;
    activeAlerts: number;
  };
  quickActions: { label: string; href: string }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function DashboardPage() {
  const { user, token, isLoading, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/api/v1/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          logout();
          router.push("/login");
          throw new Error("Session expired");
        }
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!user) return null; // Redirecting...

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1B3A5C]">
            Plan<span className="text-[#0D9488]">View</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name} <span className="text-gray-400">({user.role})</span>
            </span>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="text-sm text-red-600 hover:text-red-800 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {data?.welcome || `Welcome, ${user.name}`}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Searches Today</p>
            <p className="text-3xl font-bold text-[#1B3A5C]">{data?.stats.searchesToday ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Saved Properties</p>
            <p className="text-3xl font-bold text-[#1B3A5C]">{data?.stats.savedProperties ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Active Alerts</p>
            <p className="text-3xl font-bold text-[#1B3A5C]">{data?.stats.activeAlerts ?? 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data?.quickActions || []).map((action) => (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-[#0D9488] hover:shadow-sm transition"
            >
              <p className="font-medium text-gray-900">{action.label}</p>
              <p className="text-sm text-gray-500 mt-1">→ {action.href}</p>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
