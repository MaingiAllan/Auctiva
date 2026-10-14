"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Auth } from "./api";

const KEY = "auctiva-auth";
type Ctx = { user: Auth | null; ready: boolean; signIn: (a: Auth) => void; signOut: () => void };
const C = createContext<Ctx>({ user: null, ready: false, signIn: () => {}, signOut: () => {} });
export const useAuth = () => useContext(C);

// Token lives in localStorage. Simple, but readable by any script on the page; move to an httpOnly cookie before handling payments.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Auth | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const u: Auth | null = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (u && JSON.parse(atob(u.token.split(".")[1])).exp * 1000 > Date.now()) setUser(u); else localStorage.removeItem(KEY);
    } catch { localStorage.removeItem(KEY); }
    setReady(true);
  }, []);
  const signIn = (a: Auth) => { localStorage.setItem(KEY, JSON.stringify(a)); setUser(a); };
  const signOut = () => { localStorage.removeItem(KEY); setUser(null); };
  return <C.Provider value={{ user, ready, signIn, signOut }}>{children}</C.Provider>;
}
