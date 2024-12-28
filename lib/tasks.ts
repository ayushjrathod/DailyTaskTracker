import clientPromise from "@/lib/db";
import { Frequency, Task } from "@/types/tasks";
import { ObjectId } from "mongodb";

export async function fetchTasksFromDB() {
  try {
    const client = await clientPromise;
    const database = client.db("dailytasktracker");
    const tasksCollection = database.collection("tasks");
    const tasks = await tasksCollection.find({}).toArray();
    ("Fetched tasks from database");
    return tasks.map((task) => ({
      id: task._id.toString(),
      name: task.name,
      status: task.status,
      frequency: task.frequency || { type: "daily" }, // Ensure default frequency
      // Ensure necessary fields for specific frequencies
      ...(task.frequency?.type === "weekly" && { daysOfWeek: task.frequency.daysOfWeek || [] }),
      ...(task.frequency?.type === "monthly" && { datesOfMonth: task.frequency.datesOfMonth || [] }),
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const client = await clientPromise;
  const database = client.db("dailytasktracker");
  const task = await database.collection("tasks").findOne({ _id: new ObjectId(taskId) });
  if (!task) return null;
  return {
    id: task._id.toString(),
    name: task.name,
    status: task.status,
    frequency: task.frequency || { type: "daily" }, // Default frequency
    ...(task.frequency?.type === "weekly" && { daysOfWeek: task.frequency.daysOfWeek || [] }),
    ...(task.frequency?.type === "monthly" && { datesOfMonth: task.frequency.datesOfMonth || [] }),
  };
}

export async function updateTaskStatus(
  taskId: string,
  formattedDate: string,
  status: "completed" | "failed" | "pending"
): Promise<void> {
  const client = await clientPromise;
  const database = client.db("dailytasktracker");
  // Log the date to debug the issue
  console.log("Formatted Date:", formattedDate);

  await database
    .collection("tasks")
    .updateOne({ _id: new ObjectId(taskId) }, { $set: { [`status.${formattedDate}`]: status } });
}

export async function updateTaskName(id: string, name: string, frequency?: Frequency): Promise<Task> {
  const client = await clientPromise;
  const database = client.db("dailytasktracker");
  const updateData: Partial<Task> = { name };
  if (frequency) {
    updateData.frequency = frequency;
  }
  await database.collection("tasks").updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  const updatedTask = await getTaskById(id);

  if (!updatedTask) {
    throw new Error("Task not found after update");
  }

  return updatedTask;
}

export async function saveTaskToDB(task: Task) {
  try {
    const client = await clientPromise;
    const database = client.db("dailytasktracker");
    const tasksCollection = database.collection("tasks");
    const result = await tasksCollection.insertOne(task);
    return {
      id: result.insertedId.toString(),
      name: task.name,
      status: task.status,
      frequency: task.frequency,
    };
  } catch (error) {
    console.error("Error saving task:", error);
    throw error;
  }
}

export async function deleteTaskFromDB(taskId: string): Promise<void> {
  try {
    const client = await clientPromise;
    const database = client.db("dailytasktracker");
    const tasksCollection = database.collection("tasks");
    await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}
