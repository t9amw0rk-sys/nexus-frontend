import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { NexusSidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { useSession } from "@/lib/session-store";

export function AppShell({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const session = useSession();
  const nav = useNavigate();
  // ✅ FIX: checking state — بيمنع الصفحة من الظهور لحظة قبل الـ redirect
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      nav({ to: "/login" });
      return;
    }

    if (requireAdmin) {
      try {
        const userRaw = localStorage.getItem("nexus.session");
        const s = userRaw ? JSON.parse(userRaw) : null;
        if (s?.role !== "Admin") {
          nav({ to: "/dashboard" });
          return;
        }
      } catch {
        nav({ to: "/login" });
        return;
      }
    }

    // كل شيء تمام — اظهر المحتوى
    setChecking(false);
  }, [nav, requireAdmin]);

  // ✅ FIX: لو لسه بيتحقق، ارجع null عشان مينعش flash للصفحة
  if (checking) return null;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <NexusSidebar isAdmin={session?.role === "Admin"} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 p-6 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
