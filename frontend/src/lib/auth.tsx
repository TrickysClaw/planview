"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if we have a stored token and validate it
  useEffect(() => {
    const storedToken = localStorage.getItem("planview_token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Validate token with backend
    fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Invalid session");
      })
      .then((data) => {
        setUser(data.user);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem("planview_token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      // Store token securely
      localStorage.setItem("planview_token", data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Is the backend running?" };
    }
  };

  const logout = () => {
    if (token) {
      // Tell backend to invalidate
      fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {}); // fire and forget
    }
    localStorage.removeItem("planview_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
