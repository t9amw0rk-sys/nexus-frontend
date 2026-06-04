import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, KanbanSquare, User, Bell, Settings, Crown, ChevronLeft, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { NexusLogo } from "./logo";
import { Avatar } from "./avatar";
import { getInitials } from "@/lib/profile-store";
import { useSession, logout as doLogout } from "@/lib/session-store";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/kanban", label: "Kanban Board", icon: KanbanSquare },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/admin", label: "Admin Panel", icon: Crown, admin: true },
];

export function NexusSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const session = useSession();

  useEffect(() => { setMounted(true); }, []);

  const name = mounted ? (session?.name ?? "") : "";
  const email = mounted ? (session?.email ?? "") : "";
  const initials = mounted ? getInitials(name) : "U";

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative h-screen sticky top-0 bg-sidebar border-r border-border flex flex-col z-30"
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-20 z-40 w-6 h-6 rounded-full bg-surface-elevated border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-md"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
          <ChevronLeft className="w-3.5 h-3.5" />
        </motion.div>
      </button>

      <div className="px-5 py-6 flex items-center min-h-[72px]">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NexusLogo size={26} showText={false} />
            </motion.div>
          ) : (
            <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NexusLogo />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.filter((i) => !i.admin || isAdmin).map((item) => {
          const active = path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="block group relative">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {active && (
                  <motion.div layoutId="active-pill" className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r" />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {collapsed && (
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors ${collapsed ? "justify-center" : ""}`}>
          <Link to="/profile" className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar initials={initials} color="#6C63FF" size={36} src={null} />
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" suppressHydrationWarning>{name}</div>
                  <div className="text-xs text-muted-foreground truncate" suppressHydrationWarning>{email}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          {!collapsed && (
            <button onClick={() => { doLogout(); nav({ to: "/login" }); }} aria-label="Log out" className="text-muted-foreground hover:text-danger">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
