import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTasks } from "@/lib/task-store";
import { useProjectStore } from "@/lib/project-store";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const tasks = useTasks();
  const { projects } = useProjectStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filteredTasks = tasks.filter((t) => t.title.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 3);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-32"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-surface-elevated border border-border rounded-lg shadow-modal overflow-hidden">
            <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search tasks and projects..." className="flex-1 bg-transparent outline-none text-base" />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border">ESC</kbd>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {filteredTasks.length > 0 && (
                <Section title="Tasks" items={filteredTasks.map((t) => ({ key: t.id, label: t.title, sub: t.project || t.status }))} />
              )}
              {filteredProjects.length > 0 && (
                <Section title="Projects" items={filteredProjects.map((p) => ({ key: p.id, label: p.name, sub: `${p.tasksCount ?? 0} tasks` }))} />
              )}
              {!filteredTasks.length && !filteredProjects.length && (
                <div className="text-center text-sm text-muted-foreground py-10">No results</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, items }: { title: string; items: { key: string; label: string; sub: string }[] }) {
  return (
    <div className="mb-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5">{title}</div>
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{item.label}</div>
            <div className="text-xs text-muted-foreground truncate">{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
