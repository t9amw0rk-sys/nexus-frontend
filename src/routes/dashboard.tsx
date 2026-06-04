import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ListChecks, Zap, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell
} from "recharts";
import { AppShell } from "@/components/nexus/app-shell";
import { CountUp } from "@/components/nexus/count-up";
import { taskStore, useTasks } from "@/lib/task-store";
import { useProjectStore } from "@/lib/project-store";
import { useSession } from "@/lib/session-store";
import { TaskCard } from "@/components/nexus/task-card";
import { TaskDrawer } from "@/components/nexus/task-drawer";
import { Avatar } from "@/components/nexus/avatar";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const [loading, setLoading]   = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tasks   = useTasks();
  const session = useSession();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects().then(() => setLoading(false));
  }, []);

  // لما الـ projects تتحمل، نحمل الـ tasks بتاعتهم
  useEffect(() => {
    if (projects.length > 0) {
      Promise.all(projects.map((p) => taskStore.loadForProject(p.id)));
    }
  }, [projects.length]);

  // ── Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const total      = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const done       = tasks.filter((t) => t.status === "done").length;
    const overdue    = tasks.filter((t) => t.status !== "done" && new Date(t.dueDate) < new Date()).length;
    return [
      { label: "Total Tasks", value: total,      icon: ListChecks,    color: "#6C63FF" },
      { label: "In Progress", value: inProgress,  icon: Zap,           color: "#00BCD4" },
      { label: "Completed",   value: done,        icon: CheckCircle2,  color: "#22C55E" },
      { label: "Overdue",     value: overdue,     icon: AlertTriangle, color: "#EF4444" },
    ];
  }, [tasks]);

  // ── Pie chart ──────────────────────────────────────────
  const statusData = useMemo(() => [
    { name: "Done",        value: tasks.filter((t) => t.status === "done").length,        color: "#22C55E" },
    { name: "In Progress", value: tasks.filter((t) => t.status === "in-progress").length, color: "#00BCD4" },
    { name: "To Do",       value: tasks.filter((t) => t.status === "todo").length,        color: "#F59E0B" },
    { name: "Overdue",     value: tasks.filter((t) => t.status !== "done" && new Date(t.dueDate) < new Date()).length, color: "#EF4444" },
  ].filter((d) => d.value > 0), [tasks]);

  // ── Weekly bar chart — tasks created this week ─────────
  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts: Record<string, { completed: number; created: number }> = {};
    days.forEach((d) => { counts[d] = { completed: 0, created: 0 }; });
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    tasks.forEach((t) => {
      const d = new Date(t.dueDate);
      if (d >= startOfWeek) {
        const label = days[d.getDay()];
        counts[label].created++;
        if (t.status === "done") counts[label].completed++;
      }
    });
    // إعادة الترتيب من Mon → Sun
    const ordered = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return ordered.map((day) => ({ day, ...counts[day] }));
  }, [tasks]);

  // ── Recent activity from tasks ────────────────────────
  const recentActivity = useMemo(() => {
    return tasks
      .flatMap((t) => t.activity.map((a) => ({ ...a, taskTitle: t.title })))
      .slice(0, 8);
  }, [tasks]);

  if (loading) return <AppShell><DashboardSkeleton /></AppShell>;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">
          Welcome back{session?.name ? `, ${session.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening across your workspace.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${s.color}22`, color: s.color }}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="font-display text-3xl font-bold" style={{ color: s.color }}>
              <CountUp to={s.value} />
            </div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-semibold mb-4 text-foreground">Weekly Task Activity</h3>
          <div className="h-64">
            {weeklyData.every((d) => d.created === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Zap className="w-8 h-8 opacity-20" />
                <p className="text-sm">No tasks this week yet</p>
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={weeklyData} barGap={4}>
                  <XAxis dataKey="day" stroke="#A0AEC0" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="#A0AEC0" fontSize={12} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  />
                  <Bar dataKey="created"   name="Created"   fill="#6C63FF" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#22C55E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-semibold mb-4 text-foreground">Task Status Overview</h3>
          {statusData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <CheckCircle2 className="w-8 h-8 opacity-20" />
              <p className="text-sm">No tasks yet</p>
            </div>
          ) : (
            <>
              <div className="h-48 flex items-center">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                      {statusData.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-foreground">{s.name}</span>
                    <span className="text-muted-foreground ml-auto font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Kanban preview + Recent activity */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Kanban Preview</h3>
            <Link to="/kanban" className="text-xs text-primary hover:underline font-medium">View Full Board →</Link>
          </div>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
              <ListChecks className="w-8 h-8 opacity-20" />
              <p className="text-sm">No tasks yet — <Link to="/kanban" className="text-primary hover:underline">create one</Link></p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {(["todo", "in-progress", "done"] as const).map((s) => {
                const col = tasks.filter((t) => t.status === s);
                return (
                  <div key={s} className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${s === "todo" ? "bg-warning" : s === "in-progress" ? "bg-accent" : "bg-success"}`} />
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                        {s.replace("-", " ")}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{col.length}</span>
                    </div>
                    {col.length === 0
                      ? <div className="h-12 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground/50">Empty</div>
                      : col.slice(0, 2).map((t) => (
                          <TaskCard key={t.id} task={t} onClick={() => setActiveId(t.id)} />
                        ))
                    }
                    {col.length > 2 && (
                      <Link to="/kanban" className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors py-1">
                        +{col.length - 2} more
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
              <Clock className="w-8 h-8 opacity-20" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight">
                      <span className="font-medium text-foreground">{a.taskTitle}</span>{" "}
                      <span className="text-muted-foreground">— {a.text}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TaskDrawer taskId={activeId} onClose={() => setActiveId(null)} />
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 rounded-md bg-muted shimmer" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-card border border-border shimmer" />)}
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 h-72 rounded-xl bg-card border border-border shimmer" />
        <div className="lg:col-span-2 h-72 rounded-xl bg-card border border-border shimmer" />
      </div>
    </div>
  );
}