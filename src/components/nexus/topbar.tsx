import { Bell, Search, Command, User as UserIcon, Settings as SettingsIcon, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Avatar } from "./avatar";
import { ThemeToggle } from "./theme-toggle";
import { CommandPalette } from "./command-palette";
import { getInitials } from "@/lib/profile-store";
import { useSession, logout as doLogout } from "@/lib/session-store";
import { useUnreadCount } from "@/lib/notif-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const [openCmd, setOpenCmd] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nav = useNavigate();
  const session = useSession();
  const unread = useUnreadCount();

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => { setWiggle(true); setTimeout(() => setWiggle(false), 800); }, 8000);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpenCmd(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => { clearInterval(t); window.removeEventListener("keydown", onKey); };
  }, []);

  const name = mounted ? (session?.name ?? "") : "";
  const email = mounted ? (session?.email ?? "") : "";
  const initials = mounted ? getInitials(name) : "U";

  return (
    <>
      <header className="h-16 border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20 px-6 flex items-center gap-4">
        <button
          onClick={() => setOpenCmd(true)}
          className="flex-1 max-w-md h-10 rounded-md bg-muted/60 border border-border px-3 flex items-center gap-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search tasks, projects, people...</span>
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-background border border-border">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
        <div className="ml-auto flex items-center gap-4">
          <Link to="/notifications" aria-label="Notifications">
            <motion.div animate={wiggle ? { rotate: [0, -15, 15, -15, 15, 0] } : {}} transition={{ duration: 0.6 }} className="relative w-10 h-10 rounded-md hover:bg-muted flex items-center justify-center">
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[10px] rounded-full bg-danger text-white flex items-center justify-center">{unread}</span>
              )}
            </motion.div>
          </Link>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Account menu" className="rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <Avatar initials={initials} color="#6C63FF" size={36} src={null} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm font-medium" suppressHydrationWarning>{name}</div>
                <div className="text-xs text-muted-foreground font-normal" suppressHydrationWarning>{email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => nav({ to: "/profile" })}>
                <UserIcon className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => nav({ to: "/settings" })}>
                <SettingsIcon className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { doLogout(); nav({ to: "/login" }); }} className="text-danger focus:text-danger">
                <LogOut className="w-4 h-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <CommandPalette open={openCmd} onClose={() => setOpenCmd(false)} />
    </>
  );
}
