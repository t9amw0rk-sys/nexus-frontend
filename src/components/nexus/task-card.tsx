import { Calendar, MessageSquare, Paperclip } from "lucide-react";
import type { Task } from "@/lib/task-store";
import { dueColor } from "@/lib/task-store";
import { Avatar } from "./avatar";

const priorityDot: Record<string, string> = {
  urgent: "bg-red-500",
  high:   "bg-orange-500",
  medium: "bg-yellow-400",
  low:    "bg-green-500",
};

const priorityLabel: Record<string, string> = {
  urgent: "Urgent", high: "High", medium: "Medium", low: "Low",
};

export function TaskCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  const due = dueColor(task.dueDate);
  const dateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200 select-none"
    >
      {/* Priority indicator + title */}
      <div className="flex items-start gap-2.5 mb-3">
        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityDot[task.priority] ?? "bg-gray-400"}`} />
        <h4 className="font-medium text-sm leading-snug flex-1 line-clamp-2">{task.title}</h4>
        <Avatar initials={task.assignee.initials} color={task.assignee.color} size={24} />
      </div>

      {/* Progress bar */}
      {task.progress > 0 && (
        <div className="mb-3">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
          task.priority === "urgent" || task.priority === "high"
            ? "bg-danger/10 text-danger"
            : task.priority === "medium"
            ? "bg-warning/10 text-warning"
            : "bg-success/10 text-success"
        }`}>
          {priorityLabel[task.priority]}
        </span>

        {dateStr && (
          <span className={`flex items-center gap-1 ${due.cls}`}>
            <Calendar className="w-3 h-3" />
            {dateStr}
            {due.label === "overdue" && " · overdue"}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {task.comments.length}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              {task.attachments.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
