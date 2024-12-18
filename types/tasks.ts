export interface Task {
  id: string;
  name: string;
  status: Record<string, "completed" | "failed" | "pending">;
}

export interface DayStatus {
  date: string;
  tasks: Record<string, "completed" | "failed" | "pending">;
}
