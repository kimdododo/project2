"use client";

import { useEffect, useState } from "react";

const THEMES = { light: "bumblebee", dark: "business" }; // DaisyUI preset names

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme");
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", THEMES[initial]);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", THEMES[next]);
    try { localStorage.setItem("theme", next); } catch {}
  };

  return (
    <button onClick={toggle} className="btn btn-sm btn-ghost" title="테마 전환">
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}


