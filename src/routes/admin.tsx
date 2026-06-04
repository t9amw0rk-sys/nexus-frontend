import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Users, FolderKanban, ListChecks, Activity, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/nexus/app-shell";
import { CountUp } from "@/components/nexus/count-up";
import { useTasks } from "@/lib/task-store";
import { useProjectStore } from "@/lib/project-store";
import { usersApi } from "@/lib/api";
import { Avatar } from "@/components/nexus/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({ component: Admin });

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

type AdminUser = { id: string; name: string; email: string; role: string; active: boolean; initials: string; color: string };

const COLORS = ["#6C63FF","#00BCD4","#22C55E","#F59E0B","#EF4444","#8B5CF6","#EC4899"];

const statusBadge = (s: string) =>
  s === "in-progress" ? "bg-accent/15 text-accent" :
  s === "todo"        ? "bg-warning/15 text-warning" :
                        "bg-success/15 text-success";

function Admin() {
  const [users, setUsers]   = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const tasks = useTasks();
  const { projects, fetchProjects } = useProjectStore();

  const [fStatus,   setFStatus]   = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fAssignee, setFAssignee] = useState("all");

  useEffect(() => {
    fetchProjects();
    usersApi.getAll().then((res) => {
      const data = res.data.data ?? [];
      setUsers(data.map((u: any, i: number) => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        role: u.role ?? "User",
        active: u.isActive ?? true,
        initials: initials(u.fullName),
        color: COLORS[i % COLORS.length],
      })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => tasks.filter((t) =>
    (fStatus   === "all" || t.status        === fStatus) &&
    (fPriority === "all" || t.priority      === fPriority) &&
    (fAssignee === "all" || t.assignee.name === fAssignee)
  ), [tasks, fStatus, fPriority, fAssignee]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminStats = [
    { icon: Users,       label: "Total Users",      value: users.length,    color: "#6C63FF" },
    { icon: FolderKanban,label: "Active Projects",  value: projects.length, color: "#00BCD4" },
    { icon: ListChecks,  label: "Total Tasks",      value: tasks.length,    color: "#22C55E" },
    { icon: Activity,    label: "System Health",    value: 100, suffix: "%",color: "#22C55E" },
  ];

  const saveUser = (next: AdminUser) => {
    setUsers((list) => list.map((u) => u.id === editing?.id ? next : u));
    setEditing(null);
    toast.success("User updated");
  };

  return (
    <AppShell requireAdmin>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
        <span className="px-2 py-1 rounded bg-primary/15 text-primary text-xs font-semibold">ADMIN</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {adminStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-lg p-5 shadow-card">
            <div className="w-10 h-10 rounded-md flex items-center justify-center mb-3" style={{ background: `${s.color}22`, color: s.color }}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="font-display text-3xl font-bold flex items-center gap-2">
              <CountUp to={s.value} />{s.suffix}
              {s.label === "System Health" && <span className="w-2 h-2 rounded-full bg-success animate-pulse" />}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-card">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="font-semibold">Users Management</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
              className="h-9 pl-9 pr-3 rounded-md bg-muted/50 border border-border text-sm outline-none focus:border-primary" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left py-2 px-3">User</th>
                <th className="text-left py-2 px-3">Email</th>
                <th className="text-left py-2 px-3">Role</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-right py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center text-sm text-muted-foreground py-6">Loading...</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-3"><div className="flex items-center gap-2"><Avatar initials={u.initials} color={u.color} size={28} />{u.name}</div></td>
                  <td className="py-3 px-3 text-muted-foreground">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${u.role === "Admin" ? "bg-primary/15 text-primary" : u.role === "Manager" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs ${u.active ? "text-success" : "text-muted-foreground"}`}>
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button onClick={() => setEditing(u)} className="text-xs text-primary hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
              {!loading && filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="text-center text-sm text-muted-foreground py-6">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projects + Tasks */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h2 className="font-semibold mb-4">Projects Overview</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map((p) => (
                <div key={p.id} className="bg-surface border border-border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <Avatar initials={initials(p.owner?.fullName ?? "U")} color="#6C63FF" size={24} />
                  </div>
                  <div className="text-xs text-muted-foreground">{p.tasksCount ?? 0} tasks</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress ?? 0}%` }} transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-primary to-accent" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h2 className="font-semibold mb-4">All Tasks</h2>
          <div className="flex gap-2 mb-3 flex-wrap">
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="h-8 px-2 rounded-md bg-muted/50 border border-border text-xs outline-none">
              <option value="all">All status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select value={fPriority} onChange={(e) => setFPriority(e.target.value)} className="h-8 px-2 rounded-md bg-muted/50 border border-border text-xs outline-none">
              <option value="all">All priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tasks yet.</p>
            ) : filteredTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-xs">
                <span className="flex-1 font-medium truncate">{t.title}</span>
                <span className={`px-2 py-0.5 rounded uppercase font-semibold ${statusBadge(t.status)}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditUserDialog user={editing} onClose={() => setEditing(null)} onSave={saveUser} />
    </AppShell>
  );
}

function EditUserDialog({ user, onClose, onSave }: { user: AdminUser | null; onClose: () => void; onSave: (u: AdminUser) => void }) {
  const [draft, setDraft] = useState<AdminUser | null>(user);
  useEffect(() => { setDraft(user); }, [user]);

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit user</DialogTitle></DialogHeader>
        {draft && (
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-sm outline-none">
                <option>Admin</option><option>Manager</option><option>User</option>
              </select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => draft && onSave(draft)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
