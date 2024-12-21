export interface Task {
  id: string; // Changed from number to string
  name: string;
  status: Record<string, "completed" | "failed" | "pending">;
  frequency: Frequency;
}

export type Frequency =
  | { type: "daily" }
  | { type: "weekly"; daysOfWeek: string[] }
  | { type: "monthly"; datesOfMonth: number[] };

export interface DayStatus {
  date: string;
  tasks: Record<string, "completed" | "failed" | "pending">;
}
