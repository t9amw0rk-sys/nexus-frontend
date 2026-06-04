import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AtSign, UserPlus, AlertTriangle, BellOff, Trash2 } from "lucide-react";
import { AppShell } from "@/components/nexus/app-shell";
import { notifStore, useNotifications } from "@/lib/notif-store";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({ component: Notifs });

const tabs = ["All", "Mentions", "Assigned to you", "Deadlines"] as const;

const typeIcon: Record<string, React.ReactNode> = {
  mention:       <AtSign className="w-4 h-4 text-primary" />,
  task_assigned: <UserPlus className="w-4 h-4 text-success" />,
  deadline:      <AlertTriangle className="w-4 h-4 text-warning" />,
};

function Notifs() {
  const [tab, setTab] = useState<string>("All");
  const notifications = useNotifications();

  useEffect(() => { notifStore.load(); }, []);

  const filtered = tab === "All" ? notifications
    : notifications.filter((n) =>
        (tab === "Mentions" && n.type === "mention") ||
        (tab === "Assigned to you" && n.type === "task_assigned") ||
        (tab === "Deadlines" && n.type === "deadline")
      );

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        <button onClick={async () => { await notifStore.markAllRead(); toast.success("All marked as read"); }}
          className="text-sm text-primary hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-muted/40 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              tab === t ? "bg-card shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-w-2xl">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground gap-3">
            <BellOff className="w-10 h-10 opacity-30" />
            <p className="text-sm">No notifications here</p>
          </div>
        ) : (
          filtered.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                !n.isRead ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}>
              <div className="mt-0.5">{typeIcon[n.type] ?? <AtSign className="w-4 h-4" />}</div>
              <div className="flex-1 min-w-0">
                {n.fromUser && <span className="font-medium text-sm">{n.fromUser.fullName} </span>}
                <span className="text-sm text-muted-foreground">{n.message}</span>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.isRead && (
                  <button onClick={() => notifStore.markRead(n.id)} className="text-xs text-primary hover:underline">
                    Mark read
                  </button>
                )}
                <button onClick={() => notifStore.remove(n.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </AppShell>
  );
}
