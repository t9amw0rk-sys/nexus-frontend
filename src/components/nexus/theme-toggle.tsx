import { Moon, Sun } from "lucide-react";
import { themeStore, useTheme } from "@/lib/theme-store";

export function ThemeToggle() {
  const theme = useTheme();
  const light = theme === "light";
  return (
    <button
      onClick={() => themeStore.toggle()}
      className="relative w-12 h-7 rounded-full bg-muted border border-border flex items-center px-1 transition-colors"
      aria-label="Toggle theme"
    >
      <div className={`absolute top-0.5 ${light ? "left-[1.4rem]" : "left-0.5"} w-6 h-6 rounded-full bg-primary flex items-center justify-center transition-all duration-300`}>
        {light ? <Sun className="w-3.5 h-3.5 text-white" /> : <Moon className="w-3.5 h-3.5 text-white" />}
      </div>
    </button>
  );
}
