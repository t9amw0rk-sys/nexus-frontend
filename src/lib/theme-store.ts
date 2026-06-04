import { useSyncExternalStore } from "react";

const KEY = "nexus.theme";
type Theme = "dark" | "light";
let theme: Theme = "dark";
const listeners = new Set<() => void>();

function apply(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light", t === "light");
  document.documentElement.style.transition = "background-color 0.3s ease, color 0.3s ease";
}

if (typeof window !== "undefined") {
  try { theme = (localStorage.getItem(KEY) as Theme) || "dark"; } catch {}
  apply(theme);
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) { theme = (e.newValue as Theme) || "dark"; apply(theme); listeners.forEach((l) => l()); }
  });
}

export const themeStore = {
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  get(): Theme { return theme; },
  set(t: Theme) { theme = t; if (typeof window !== "undefined") localStorage.setItem(KEY, t); apply(t); listeners.forEach((l) => l()); },
  toggle() { this.set(theme === "dark" ? "light" : "dark"); },
};

export function useTheme(): Theme {
  return useSyncExternalStore(themeStore.subscribe, themeStore.get, () => "dark");
}
