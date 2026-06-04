import { useSyncExternalStore } from "react";
import { tasksApi, commentsApi, usersApi } from "./api";

export type Status = "todo" | "in-progress" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";

export type Comment = {
  id: string;
  author: string;
  initials: string;
  color: string;
  text: string;
  time: string;
};

export type Activity = { id: string; text: string; time: string };

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  progress: number;
  dueDate: string;
  assignee: { name: string; initials: string; color: string };
  project: string;
  comments: Comment[];
  activity: Activity[];
  attachments: string[];
};

export type ExtendedTask = Task;

// Real users from API
export type PersonOption = { id: string; name: string; initials: string; color: string };
let _people: PersonOption[] = [];
const COLORS = ["#6C63FF","#00BCD4","#22C55E","#F59E0B","#EF4444","#8B5CF6","#EC4899"];

export async function loadPeople() {
  try {
    const res = await usersApi.getAll();
    _people = (res.data.data ?? []).map((u: any, i: number) => ({
      id: u.id,
      name: u.fullName,
      initials: initials(u.fullName),
      color: COLORS[i % COLORS.length],
    }));
  } catch {}
}

export function getPeople(): PersonOption[] { return _people; }

// Legacy export for backward compatibility — empty until loaded
export const people = _people;

let tasks: Task[] = [];
let currentProjectId: string | null = null;
const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

export const taskStore = {
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  get(): Task[] { return tasks; },

  async loadForProject(projectId: string) {
    currentProjectId = projectId;
    try {
      const res = await tasksApi.getByProject(projectId);
      tasks = res.data.data.map(mapApiTask);
      notify();
    } catch (e) { console.error(e); }
  },

  async loadComments(taskId: string) {
    try {
      const res = await commentsApi.getByTask(taskId);
      const apiComments: Comment[] = (res.data.data ?? []).map((c: any) => ({
        id: c.id,
        author: c.author?.fullName ?? "Unknown",
        initials: initials(c.author?.fullName ?? "U"),
        color: "#6C63FF",
        text: c.text,
        time: formatTime(c.createdAt),
      }));
      tasks = tasks.map((t) => t.id === taskId ? { ...t, comments: apiComments } : t);
      notify();
    } catch (e) { console.error(e); }
  },

  async update(id: string, patch: Partial<Task>, activityText?: string) {
    try {
      await tasksApi.update(id, {
        title: patch.title,
        description: patch.description,
        status: patch.status,
        priority: patch.priority,
        progress: patch.progress,
        dueDate: patch.dueDate,
      });
      tasks = tasks.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };
        if (activityText) next.activity = [{ id: `a${Date.now()}`, text: activityText, time: "just now" }, ...t.activity];
        return next;
      });
      notify();
    } catch (e) { console.error(e); }
  },

  async add(t: Omit<Task, "id" | "comments" | "activity" | "attachments"> & { assigneeId?: string | null }) {
    try {
      const res = await tasksApi.create({
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        projectId: currentProjectId,
        assigneeId: (t as any).assigneeId ?? null,
      });
      const newTask = mapApiTask(res.data.data);
      tasks = [newTask, ...tasks];
      notify();
      return newTask;
    } catch (e) { console.error(e); }
  },

  // ✅ FIX: دالة delete صح — بتحذف task واحدة بس مش الكل
  async delete(id: string) {
    try {
      await tasksApi.delete(id);
      tasks = tasks.filter((t) => t.id !== id);
      notify();
    } catch (e) { console.error(e); }
  },

  async setStatus(id: string, status: Status) {
    try {
      await tasksApi.changeStatus(id, status);
      tasks = tasks.map((t) => t.id === id ? { ...t, status } : t);
      notify();
    } catch (e) { console.error(e); }
  },

  setOrder(status: Status, list: Task[]) {
    const others = tasks.filter((t) => t.status !== status);
    tasks = [...others, ...list.map((t) => ({ ...t, status }))];
    notify();
  },

  async addComment(id: string, c: Omit<Comment, "id" | "time">) {
    try {
      const res = await commentsApi.create({ taskId: id, text: c.text });
      const created = res.data.data;
      const comment: Comment = {
        id: created?.id ?? `c${Date.now()}`,
        author: c.author, initials: c.initials, color: c.color, text: c.text, time: "just now",
      };
      tasks = tasks.map((t) => t.id === id ? { ...t, comments: [...t.comments, comment] } : t);
      notify();
    } catch (e) { console.error(e); }
  },

  addAttachment(id: string, name: string) {
    tasks = tasks.map((t) => t.id === id
      ? { ...t, attachments: [...t.attachments, name], activity: [{ id: `a${Date.now()}`, text: `Attached ${name}`, time: "just now" }, ...t.activity] }
      : t);
    notify();
  },

  reset() { tasks = []; notify(); },
};

function mapApiTask(t: any): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? "",
    status: t.status as Status,
    priority: t.priority as Priority,
    progress: t.progress ?? 0,
    dueDate: t.dueDate ?? new Date().toISOString(),
    project: t.projectName ?? "",
    assignee: t.assignee
      ? { name: t.assignee.fullName, initials: initials(t.assignee.fullName), color: "#6C63FF" }
      : { name: "Unassigned", initials: "UN", color: "#9CA3AF" },
    comments: [],
    activity: [{ id: "a0", text: "Task created", time: formatTime(t.createdAt) }],
    attachments: [],
  };
}

function initials(name: string): string {
  return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(iso: string): string {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}

export function useTasks(): Task[] {
  return useSyncExternalStore(taskStore.subscribe, taskStore.get, taskStore.get);
}

export function useTask(id: string | null): Task | null {
  const all = useTasks();
  return id ? all.find((t) => t.id === id) ?? null : null;
}

export function dueColor(date: string): { cls: string; label: "overdue" | "soon" | "ok" } {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (days < 0) return { cls: "text-danger", label: "overdue" };
  if (days <= 3) return { cls: "text-warning", label: "soon" };
  return { cls: "text-success", label: "ok" };
}
