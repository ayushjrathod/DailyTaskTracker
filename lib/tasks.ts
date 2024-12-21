import clientPromise from "@/lib/db";
import { Task } from "@/types/tasks";
import { ObjectId } from "mongodb";

export async function getTaskById(taskId: string): Promise<Task | null> {
  const client = await clientPromise;
  const database = client.db("dailytasktracker");
  const task = await database.collection("tasks").findOne({ _id: new ObjectId(taskId) });
  if (!task) return null;
  return {
    id: task._id.toString(),
    name: task.name,
    status: task.status,
  };
}

export async function updateTaskStatus(
  taskId: string,
  status: Record<string, "completed" | "failed" | "pending">
): Promise<void> {
  const client = await clientPromise;
  const database = client.db("dailytasktracker");
  await database.collection("tasks").updateOne({ _id: new ObjectId(taskId) }, { $set: { status } });
}

export async function updateTaskName(id: string, name: string): Promise<Task> {
  const client = await clientPromise;
  const database = client.db("dailytasktracker");
  await database.collection("tasks").updateOne({ _id: new ObjectId(id) }, { $set: { name } });
  const updatedTask = await getTaskById(id);

  if (!updatedTask) {
    throw new Error("Task not found after update");
  }

  return updatedTask;
}
