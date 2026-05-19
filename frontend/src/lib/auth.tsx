"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("planview_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setUser(data.user);
    localStorage.setItem("planview_user", JSON.stringify(data.user));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("planview_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
