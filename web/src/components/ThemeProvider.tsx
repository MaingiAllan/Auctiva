"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type ThemePreference = "system" | "light" | "dark";
type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: "light" | "dark";
  cycleTheme: () => void;
};

const KEY = "auctiva-theme";
const ThemeContext = createContext<ThemeContextValue>({
  preference: "system",
  resolvedTheme: "light",
  cycleTheme: () => {},
});

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function applyTheme(preference: ThemePreference, systemIsDark: boolean) {
  const isDark = preference === "dark" || (preference === "system" && systemIsDark);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  return isDark ? "dark" : "light";
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const preferenceRef = useRef<ThemePreference>("system");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const stored = localStorage.getItem(KEY);
    const initialPreference = isThemePreference(stored) ? stored : "system";
    preferenceRef.current = initialPreference;
    setPreference(initialPreference);
    setResolvedTheme(applyTheme(initialPreference, media.matches));

    const onSystemThemeChange = (event: MediaQueryListEvent) => {
      if (preferenceRef.current === "system") {
        setResolvedTheme(applyTheme("system", event.matches));
      }
    };
    media.addEventListener("change", onSystemThemeChange);
    return () => media.removeEventListener("change", onSystemThemeChange);
  }, []);

  const cycleTheme = () => {
    const next: ThemePreference =
      preference === "system" ? "light" : preference === "light" ? "dark" : "system";
    localStorage.setItem(KEY, next);
    preferenceRef.current = next;
    setPreference(next);
    setResolvedTheme(applyTheme(next, window.matchMedia("(prefers-color-scheme: dark)").matches));
  };

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
