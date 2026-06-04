import { AnimatePresence, motion } from "framer-motion";
import {
  X, Calendar, User as UserIcon, Folder, Send, Check,
  Pencil, Trash2, ChevronDown, Clock, AlertCircle,
  CheckCircle2, Loader2, StickyNote, Play, Pause, RotateCcw, Timer
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { taskStore, useTask, dueColor } from "@/lib/task-store";
import { useProfile, getInitials } from "@/lib/profile-store";
import type { Status } from "@/lib/task-store";
import { Avatar } from "./avatar";

const PRIORITY_CONFIG: Record<string, { dot: string; text: string; bg: string; label: string }> = {
  urgent: { dot: "bg-red-500",    text: "text-red-400",    bg: "bg-red-500/10",    label: "Urgent" },
  high:   { dot: "bg-orange-500", text: "text-orange-400", bg: "bg-orange-500/10", label: "High"   },
  medium: { dot: "bg-yellow-400", text: "text-yellow-400", bg: "bg-yellow-400/10", label: "Medium" },
  low:    { dot: "bg-green-500",  text: "text-green-400",  bg: "bg-green-500/10",  label: "Low"    },
};

const STATUS_OPTIONS: { value: Status; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "todo",        label: "To Do",       icon: <AlertCircle  className="w-3.5 h-3.5" />, color: "text-warning" },
  { value: "in-progress", label: "In Progress", icon: <Loader2      className="w-3.5 h-3.5" />, color: "text-accent"  },
  { value: "done",        label: "Done",        icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-success" },
];

const TIMER_PRESETS = [5, 10, 15, 25, 30, 45, 60];

// ── Countdown Timer ─────────────────────────────────────────
function CountdownTimer({ taskId, onComplete }: { taskId: string; onComplete: () => void }) {
  const [selectedMins, setSelectedMins] = useState(25);
  const [totalSecs, setTotalSecs]       = useState(0);
  const [remaining, setRemaining]       = useState(0);
  const [running, setRunning]           = useState(false);
  const [started, setStarted]           = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setRemaining((p) => {
        if (p <= 1) {
          clearInterval(ref.current!);
          setRunning(false);
          onComplete();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const start = () => {
    const secs = selectedMins * 60;
    setTotalSecs(secs);
    setRemaining(secs);
    setStarted(true);
    setRunning(true);
    taskStore.setStatus(taskId, "in-progress");
  };

  const reset = () => {
    if (ref.current) clearInterval(ref.current);
    setRunning(false);
    setStarted(false);
    setRemaining(0);
  };

  const pct     = started ? Math.round(((totalSecs - remaining) / totalSecs) * 100) : 0;
  const mins    = Math.floor(remaining / 60);
  const secs    = remaining % 60;
  const r       = 54;
  const circ    = 2 * Math.PI * r;
  const offset  = circ - (circ * pct) / 100;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Focus Timer</span>
        {started && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${running ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
            {running ? "Running..." : "Paused"}
          </span>
        )}
      </div>

      {!started ? (
        /* ── Preset picker ── */
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Choose duration (minutes)</p>
          <div className="flex flex-wrap gap-2">
            {TIMER_PRESETS.map((m) => (
              <button key={m} onClick={() => setSelectedMins(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedMins === m
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}>
                {m}m
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="number" min={1} max={180} value={selectedMins}
              onChange={(e) => setSelectedMins(Math.max(1, Math.min(180, Number(e.target.value))))}
              className="w-20 h-9 px-3 rounded-lg bg-muted/50 border border-border text-sm outline-none focus:border-primary text-center" />
            <span className="text-sm text-muted-foreground">minutes</span>
            <button onClick={start}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Play className="w-4 h-4" /> Start
            </button>
          </div>
        </div>
      ) : (
        /* ── Active timer ── */
        <div className="flex items-center gap-6">
          {/* SVG ring */}
          <div className="relative flex-shrink-0" style={{ width: 128, height: 128 }}>
            <svg width={128} height={128} className="-rotate-90" viewBox="0 0 128 128">
              <circle cx={64} cy={64} r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/40" />
              <motion.circle cx={64} cy={64} r={r} fill="none"
                stroke={remaining === 0 ? "#22C55E" : "url(#timerGrad)"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
              <defs>
                <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" />
                  <stop offset="100%" stopColor="#00BCD4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {remaining === 0 ? (
                <CheckCircle2 className="w-8 h-8 text-success" />
              ) : (
                <>
                  <span className="font-mono text-2xl font-bold tabular-nums leading-none">
                    {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-muted-foreground mt-1">{pct}% done</span>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-3">
            <div className="text-sm text-muted-foreground">
              {remaining === 0
                ? "Time's up! 🎉"
                : `${Math.ceil(remaining / 60)} min remaining of ${totalSecs / 60}m session`}
            </div>
            <div className="flex gap-2">
              {remaining > 0 && (
                <button onClick={() => setRunning((r) => !r)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  {running ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Resume</>}
                </button>
              )}
              <button onClick={reset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Notes Section ───────────────────────────────────────────
function NotesSection({ taskId, initial }: { taskId: string; initial: string }) {
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(true);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChange = (val: string) => {
    setText(val);
    setSaved(false);
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      await taskStore.update(taskId, { description: val });
      setSaved(true);
    }, 800);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <StickyNote className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Notes</span>
        <span className={`ml-auto text-[10px] transition-colors ${saved ? "text-success" : "text-muted-foreground"}`}>
          {saved ? "✓ Saved" : "Saving..."}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add notes, links, or anything relevant..."
        rows={4}
        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none transition-all placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

// ── Main Drawer ─────────────────────────────────────────────
export function TaskDrawer({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {taskId && <DrawerInner key={taskId} taskId={taskId} onClose={onClose} />}
    </AnimatePresence>
  );
}

function DrawerInner({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const task    = useTask(taskId);
  const profile = useProfile();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState(task?.title ?? "");
  const [comment, setComment]           = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [statusOpen, setStatusOpen]     = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setTitleDraft(task.title);
      taskStore.loadComments(task.id);
    }
  }, [task?.id]);

  if (!task) return null;

  const due = dueColor(task.dueDate);
  const pc  = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const sc  = STATUS_OPTIONS.find((s) => s.value === task.status) ?? STATUS_OPTIONS[0];

  const saveTitle = () => {
    if (titleDraft.trim() && titleDraft !== task.title)
      taskStore.update(task.id, { title: titleDraft.trim() }, "Renamed");
    setEditingTitle(false);
  };

  const sendComment = () => {
    if (!comment.trim()) return;
    taskStore.addComment(task.id, {
      author: profile.name || "You",
      initials: getInitials(profile.name || "Y"),
      color: "#6C63FF",
      text: comment.trim(),
    });
    setComment("");
  };

  const handleDelete = async () => {
    setDeleting(true);
    await taskStore.delete(task.id);
    setDeleting(false);
    onClose();
  };

  const dateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "No date";

  return (
    <>
      <motion.div key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }} onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" />

      <motion.div key="panel"
        initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-background border-l border-border z-50 flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="relative">
            <button onClick={() => setStatusOpen((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm ${sc.color}`}>
              {sc.icon}
              <span className="font-medium text-foreground">{sc.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${statusOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {statusOpen && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-1.5 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-10 min-w-[160px]">
                  {STATUS_OPTIONS.map((o) => (
                    <button key={o.value} onClick={() => { taskStore.setStatus(task.id, o.value); setStatusOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors ${o.color} ${task.status === o.value ? "bg-muted font-medium" : ""}`}>
                      {o.icon}<span className="text-foreground">{o.label}</span>
                      {task.status === o.value && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${pc.bg} ${pc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />{pc.label}
          </div>

          <div className="flex items-center gap-0.5">
            <button onClick={() => setConfirmDelete(true)}
              className="w-8 h-8 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger flex items-center justify-center transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Title */}
          <div className="px-5 pt-5 pb-4 border-b border-border">
            {editingTitle ? (
              <div className="flex items-start gap-2">
                <input ref={titleRef} autoFocus value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                  className="flex-1 text-xl font-bold bg-transparent border-b-2 border-primary outline-none pb-1" />
                <button onClick={saveTitle} className="mt-1 p-1.5 rounded-md text-primary hover:bg-primary/10">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingTitle(true)} className="group w-full text-left flex items-start gap-2">
                <h2 className="text-xl font-bold leading-snug flex-1">{task.title}</h2>
                <Pencil className="w-4 h-4 mt-1 opacity-0 group-hover:opacity-40 text-muted-foreground flex-shrink-0 transition-opacity" />
              </button>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span className={due.cls}>{dateStr}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                <Avatar initials={task.assignee.initials} color={task.assignee.color} size={18} />
                <span>{task.assignee.name}</span>
              </div>
              {task.project && (
                <div className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" />
                  <span>{task.project}</span>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Timer */}
            <CountdownTimer taskId={task.id} onComplete={() => taskStore.setStatus(task.id, "done")} />

            {/* Notes */}
            <NotesSection taskId={task.id} initial={task.description ?? ""} />

            {/* Comments */}
            <div>
              <label className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                Comments
                {task.comments.length > 0 && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">({task.comments.length})</span>
                )}
              </label>
              <div className="space-y-3 mb-3">
                {task.comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-xl">No comments yet.</p>
                ) : task.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar initials={c.initials} color={c.color} size={30} />
                    <div className="flex-1 bg-muted/40 rounded-xl px-3.5 py-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{c.author}</span>
                        <span className="text-[10px] text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Avatar initials={getInitials(profile.name || "Y")} color="#6C63FF" size={30} src={profile.avatar} />
                <input value={comment} onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) sendComment(); }}
                  placeholder="Add a comment..."
                  className="flex-1 h-9 px-4 rounded-xl bg-muted/40 border border-border text-sm outline-none focus:border-primary transition-colors" />
                <button onClick={sendComment} disabled={!comment.trim()}
                  className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Activity */}
            {task.activity.length > 0 && (
              <div>
                <label className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" /> Activity
                </label>
                <div className="border-l-2 border-border pl-4 space-y-2">
                  {task.activity.map((a) => (
                    <div key={a.id} className="relative text-xs text-muted-foreground">
                      <span className="absolute -left-[1.2rem] top-1.5 w-1.5 h-1.5 rounded-full bg-border" />
                      {a.text} · <span className="opacity-60">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-danger" />
              </div>
              <h3 className="font-bold text-lg text-center mb-1">Delete this task?</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                "<span className="font-medium text-foreground">{task.title}</span>" will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-50">
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}