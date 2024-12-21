import { NextApiRequest, NextApiResponse } from "next";
import { getTaskById, updateTaskStatus } from "@/lib/tasks"; // Adjust the import based on your project structure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { taskId } = req.query;

  if (req.method === "PUT") {
    const { date, status } = req.body;

    if (!taskId || !date || !status) {
      return res.status(400).json({ error: "Missing taskId, date, or status" });
    }

    try {
      const task = await getTaskById(taskId as string);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      task.status[date] = status;

      // Ensure frequency is not altered
      await updateTaskStatus(taskId as string, task.status);

      return res.status(200).json({ message: "Task status updated successfully" });
    } catch (error) {
      console.error("Error updating task status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
