"use client";
import { useEffect, useState } from "react";
import BasketLoader from "./BasketLoader";

// Full-screen loader on first visit of a session (min ~1.8s so the animation reads as intentional).
export default function Splash() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("auctiva-splash")) { setShow(false); return; }
    sessionStorage.setItem("auctiva-splash", "1");
    const t1 = setTimeout(() => setFade(true), 1800);
    const t2 = setTimeout(() => setShow(false), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (!show) return null;
  return (
    <div className={`fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center bg-white transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}>
      <BasketLoader />
    </div>
  );
}
