import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { Plus, X, Play, Pause, RotateCcw, CheckCircle2, Clock, Zap, RotateCcw as Undo, FolderKanban } from "lucide-react";
import { AppShell } from "@/components/nexus/app-shell";
import { TaskDrawer } from "@/components/nexus/task-drawer";
import { taskStore, useTasks, loadPeople, getPeople } from "@/lib/task-store";
import { useProjectStore } from "@/lib/project-store";
import type { Status, Task } from "@/lib/task-store";

export const Route = createFileRoute("/kanban")({ component: KanbanPage });

type FocusSession = {
  taskId: string;
  totalSecs: number;
  remainingSecs: number;
  running: boolean;
};

// ─── New Project Modal ────────────────────────────────────
function NewProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, color: string) => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6C63FF");
  const colors = ["#6C63FF", "#00BCD4", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold text-lg">New Project</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Project name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onCreate(name.trim(), color); }}
              placeholder="My awesome project..."
              className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Color</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ background: c, outline: color === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => onCreate(name.trim(), color)}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Focus Session Modal ──────────────────────────────────
function FocusModal({ task, onStart, onClose }: { task: Task; onStart: (mins: number) => void; onClose: () => void }) {
  const [mins, setMins] = useState(25);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Focus session for</p>
            <p className="font-semibold text-sm truncate">{task.title}</p>
          </div>
        </div>
        <label className="text-sm font-medium block mb-2">Duration (minutes)</label>
        <div className="flex items-center gap-3 mb-5">
          {[10, 15, 25, 45, 60].map((v) => (
            <button key={v} onClick={() => setMins(v)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${mins === v ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-5">
          <div className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">or custom</span><div className="h-px flex-1 bg-border" />
        </div>
        <input type="number" min={1} max={180} value={mins}
          onChange={(e) => setMins(Math.max(1, Math.min(180, Number(e.target.value))))}
          className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm outline-none focus:border-primary mb-5" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          <button onClick={() => onStart(mins)} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Play className="w-4 h-4" /> Start
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Done Popup ───────────────────────────────────────────
function DonePopup({ task, onDone, onNotYet }: { task: Task; onDone: () => void; onNotYet: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-success" />
        </div>
        <h3 className="font-bold text-xl mb-1">Time's up! ⏰</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Did you finish <span className="font-semibold text-foreground">"{task.title}"</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onNotYet} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Not yet
          </button>
          <button onClick={onDone} className="flex-1 py-2.5 rounded-xl bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Done! ✅
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Timer Banner ─────────────────────────────────────────
function TimerBanner({ session, taskTitle, onPause, onResume, onCancel }: {
  session: FocusSession; taskTitle: string; onPause: () => void; onResume: () => void; onCancel: () => void;
}) {
  const mins = Math.floor(session.remainingSecs / 60);
  const secs = session.remainingSecs % 60;
  const progress = 1 - session.remainingSecs / session.totalSecs;
  return (
    <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-lg">
      <div className="h-1 bg-muted">
        <motion.div className="h-full bg-gradient-to-r from-primary to-accent" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5 }} />
      </div>
      <div className="flex items-center gap-4 px-6 py-3 max-w-4xl mx-auto">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Focus session</p>
          <p className="text-sm font-semibold truncate">{taskTitle}</p>
        </div>
        <div className={`font-mono text-2xl font-bold tabular-nums ${session.remainingSecs <= 60 ? "text-danger" : "text-foreground"}`}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <div className="flex items-center gap-2">
          {session.running ? (
            <button onClick={onPause} className="w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onResume} className="w-9 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-colors">
              <Play className="w-4 h-4" />
            </button>
          )}
          <button onClick={onCancel} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Focus Task Card ──────────────────────────────────────
function FocusTaskCard({ task, onCheck, onStartFocus, onUndo, onOpen, isActive }: {
  task: Task; onCheck?: () => void; onStartFocus?: () => void; onUndo?: () => void; onOpen: () => void; isActive: boolean;
}) {
  const isDone = task.status === "done";
  const isInProgress = task.status === "in-progress";
  const dateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
  const priorityColor: Record<string, string> = { urgent: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-400", low: "bg-green-500" };

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`group rounded-xl border p-4 transition-all duration-200 ${isActive ? "border-primary/60 bg-primary/5 shadow-md" : isDone ? "border-border bg-muted/30" : "border-border bg-card hover:border-primary/30 hover:shadow-sm"}`}>
      <div className="flex items-start gap-3">
        {task.status === "todo" && (
          <button onClick={onCheck} className="mt-0.5 w-5 h-5 rounded-full border-2 border-muted-foreground/40 flex-shrink-0 hover:border-success hover:bg-success/10 transition-colors flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-transparent group-hover:bg-success/40 transition-colors" />
          </button>
        )}
        {isDone && <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />}
        {isInProgress && <div className="mt-1.5 w-3 h-3 rounded-full bg-accent flex-shrink-0 animate-pulse" />}
        <button onClick={onOpen} className={`flex-1 text-sm font-medium text-left leading-snug transition-colors ${isDone ? "line-through text-muted-foreground" : "hover:text-primary"}`}>
          {task.title}
        </button>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${priorityColor[task.priority] ?? "bg-gray-400"}`} />
      </div>
      {isInProgress && task.progress > 0 && (
        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${task.progress}%` }} transition={{ duration: 0.5 }} />
        </div>
      )}
      {isActive && (
        <div className="mt-2 h-1 rounded-full bg-primary/20 overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {dateStr && <span>{dateStr}</span>}
          {task.comments.length > 0 && <span>{task.comments.length} comments</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {task.status === "todo" && onStartFocus && (
            <button onClick={onStartFocus} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Zap className="w-3 h-3" /> Focus
            </button>
          )}
          {isDone && onUndo && (
            <button onClick={onUndo} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
              <Undo className="w-3 h-3" /> Undo
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────
function KanbanPage() {
  const tasks = useTasks();
  const { projects, fetchProjects, createProject } = useProjectStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [addingCol, setAddingCol] = useState<Status | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);

  const [focusModal, setFocusModal] = useState<Task | null>(null);
  const [session, setSession] = useState<FocusSession | null>(null);
  const [donePopup, setDonePopup] = useState<Task | null>(null);

  const addInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchProjects().then(() => setLoading(false));
    loadPeople();
  }, []);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) setSelectedProject(projects[0].id);
  }, [projects]);

  useEffect(() => {
    if (selectedProject) {
      setLoading(true);
      taskStore.loadForProject(selectedProject).finally(() => setLoading(false));
    }
  }, [selectedProject]);

  useEffect(() => {
    if (addingCol && addInputRef.current) addInputRef.current.focus();
  }, [addingCol]);

  useEffect(() => {
    if (!session?.running) return;
    timerRef.current = setInterval(() => {
      setSession((prev) => {
        if (!prev) return null;
        const next = prev.remainingSecs - 1;
        if (next <= 0) {
          clearInterval(timerRef.current!);
          const t = tasks.find((t) => t.id === prev.taskId) ?? null;
          setDonePopup(t);
          return null;
        }
        return { ...prev, remainingSecs: next };
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session?.running, session?.taskId]);

  const startSession = useCallback((task: Task, mins: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const secs = mins * 60;
    setSession({ taskId: task.id, totalSecs: secs, remainingSecs: secs, running: true });
    if (task.status === "todo") taskStore.setStatus(task.id, "in-progress");
    setFocusModal(null);
  }, [tasks]);

  const pauseSession  = () => setSession((s) => s ? { ...s, running: false } : null);
  const resumeSession = () => setSession((s) => s ? { ...s, running: true  } : null);
  const cancelSession = () => { if (timerRef.current) clearInterval(timerRef.current); setSession(null); };

  const handleDonePopupDone   = () => { if (donePopup) taskStore.setStatus(donePopup.id, "done"); setDonePopup(null); setSession(null); };
  const handleDonePopupNotYet = () => { if (donePopup) taskStore.setStatus(donePopup.id, "todo"); setDonePopup(null); setSession(null); };

  // ✅ FIX: إنشاء project جديد من الكانبان مباشرة
  const handleCreateProject = async (name: string, color: string) => {
    try {
      const newProject = await createProject({ name, color });
      setSelectedProject(newProject.id);
      setShowNewProject(false);
    } catch {}
  };

  const handleAddTask = async (status: Status) => {
    if (!newTitle.trim() || !selectedProject) return;
    const people = getPeople();
    await taskStore.add({
      title: newTitle.trim(),
      description: "",
      status,
      priority: "medium",
      progress: 0,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      assignee: people[0]
        ? { name: people[0].name, initials: people[0].initials, color: people[0].color }
        : { name: "Unassigned", initials: "UN", color: "#9CA3AF" },
      project: selectedProject,
      assigneeId: null,
    } as any);
    setNewTitle("");
    setAddingCol(null);
  };

  const onDragStart = (id: string) => setDraggingId(id);
  const onDragEnd   = () => { setDraggingId(null); setDragOverCol(null); };
  const onDrop      = (status: Status) => {
    if (!draggingId) return;
    const task = tasks.find((t) => t.id === draggingId);
    if (task && task.status !== status) taskStore.setStatus(task.id, status);
    setDraggingId(null);
    setDragOverCol(null);
  };

  const COLUMNS: { id: Status; label: string; color: string }[] = [
    { id: "todo",        label: "To Do",       color: "bg-warning/10 text-warning border-warning/30" },
    { id: "in-progress", label: "In Progress", color: "bg-accent/10 text-accent border-accent/30" },
    { id: "done",        label: "Done",        color: "bg-success/10 text-success border-success/30" },
  ];

  const sessionTask = session ? tasks.find((t) => t.id === session.taskId) : null;

  return (
    <AppShell>
      <AnimatePresence>
        {session && sessionTask && (
          <TimerBanner session={session} taskTitle={sessionTask.title} onPause={pauseSession} onResume={resumeSession} onCancel={cancelSession} />
        )}
      </AnimatePresence>

      {session && <div className="h-14" />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Kanban Board</h1>
          <p className="text-muted-foreground text-sm mt-1">Drag tasks or use focus sessions to stay on track.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* ✅ FIX: زرار New Project دايماً موجود */}
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
          {projects.length > 0 && (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="h-9 px-3 rounded-md bg-muted/50 border border-border text-sm outline-none focus:border-primary"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* No projects empty state */}
      {!loading && projects.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FolderKanban className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">No projects yet</p>
            <p className="text-sm mt-1">Create your first project to start managing tasks.</p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create First Project
          </button>
        </motion.div>
      )}

      {/* Board */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            const isDragTarget = dragOverCol === col.id;
            return (
              <div key={col.id}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => onDrop(col.id)}
                className={`rounded-xl border bg-card transition-all duration-200 ${isDragTarget ? "ring-2 ring-primary/50 bg-primary/5" : "border-border"}`}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${col.color}`}>{col.label}</span>
                    <span className="text-xs text-muted-foreground font-medium">{colTasks.length}</span>
                  </div>
                  <button onClick={() => { setAddingCol(col.id); setNewTitle(""); }}
                    className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 space-y-2 min-h-[120px]">
                  {loading ? (
                    [0, 1, 2].map((i) => <div key={i} className="h-24 rounded-xl bg-muted shimmer" />)
                  ) : colTasks.length === 0 && !isDragTarget ? (
                    <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">No tasks</div>
                  ) : (
                    <AnimatePresence>
                      {colTasks.map((task) => (
                        <div key={task.id} draggable onDragStart={() => onDragStart(task.id)} onDragEnd={onDragEnd}
                          className="cursor-grab active:cursor-grabbing" style={{ opacity: draggingId === task.id ? 0.4 : 1 }}>
                          <FocusTaskCard task={task} isActive={session?.taskId === task.id} onOpen={() => setActiveId(task.id)}
                            onCheck={task.status === "todo" ? () => taskStore.setStatus(task.id, "done") : undefined}
                            onStartFocus={task.status === "todo" ? () => setFocusModal(task) : undefined}
                            onUndo={task.status === "done" ? () => taskStore.setStatus(task.id, "todo") : undefined}
                          />
                        </div>
                      ))}
                    </AnimatePresence>
                  )}
                  <AnimatePresence>
                    {addingCol === col.id && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="bg-muted/60 border border-border rounded-xl p-3 space-y-2">
                        <input ref={addInputRef} value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(col.id); if (e.key === "Escape") setAddingCol(null); }}
                          placeholder="Task title..." className="w-full bg-transparent text-sm outline-none" />
                        <div className="flex gap-2">
                          <button onClick={() => handleAddTask(col.id)} className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">Add</button>
                          <button onClick={() => setAddingCol(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onCreate={handleCreateProject} />}
      </AnimatePresence>
      <AnimatePresence>
        {focusModal && <FocusModal task={focusModal} onStart={(mins) => startSession(focusModal, mins)} onClose={() => setFocusModal(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {donePopup && <DonePopup task={donePopup} onDone={handleDonePopupDone} onNotYet={handleDonePopupNotYet} />}
      </AnimatePresence>

      <TaskDrawer taskId={activeId} onClose={() => setActiveId(null)} />
    </AppShell>
  );
}