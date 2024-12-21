export interface Task {
  id: string; // Changed from number to string
  name: string;
  status: Record<string, "completed" | "failed" | "pending">;
}

export interface DayStatus {
  date: string;
  tasks: Record<string, "completed" | "failed" | "pending">;
}
