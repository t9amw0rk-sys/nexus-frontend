export type Priority = "high" | "medium" | "low" | "urgent";
export type Status = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  assignee: { name: string; avatar?: string; initials: string; color: string };
  project: string;
  progress: number;
}

// recentActivity فاضي — مش بنستخدم داتا وهمية
export const recentActivity: {
  id: number;
  who: { name: string; initials: string; color: string };
  action: string;
  target: string;
  time: string;
}[] = [];
