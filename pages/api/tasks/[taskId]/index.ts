import { NextApiRequest, NextApiResponse } from "next";
import { getTaskById, updateTaskName } from "@/lib/tasks"; // Adjust the import based on your project structure
import type { Task, Frequency } from "@/types/tasks"; // Import the updated Task and Frequency interfaces

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { taskId } = req.query;

  if (req.method === "PUT") {
    const { name, frequency } = req.body;

    if (!taskId || !name || !frequency) {
      return res.status(400).json({ error: "Missing taskId, name, or frequency" });
    }

    try {
      const task = await getTaskById(taskId as string);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const updatedTask: Task = await updateTaskName(taskId as string, name, frequency);

      // Ensure frequency is included in the response
      return res.status(200).json(updatedTask);
    } catch (error) {
      console.error("Error updating task name:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
