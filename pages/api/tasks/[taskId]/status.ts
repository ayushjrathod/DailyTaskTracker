import { NextApiRequest, NextApiResponse } from "next";
import { getTaskById, updateTaskStatus } from "@/lib/tasks"; // Adjust the import based on your project structure
import type { Task } from "@/types/tasks"; // Import the updated Task interface

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { taskId } = req.query;

  if (req.method === "PUT") {
    const { date, status } = req.body;

    if (!taskId || !date || !status) {
      return res.status(400).json({ error: "Missing taskId, date, or status" });
    }

    try {
      // Format the date to 'YYYY-MM-DD'
      const formattedDate = formatDate(new Date(date));

      const task = await getTaskById(taskId as string);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      await updateTaskStatus(taskId as string, formattedDate, status);

      return res.status(200).json({ message: "Task status updated successfully" });
    } catch (error) {
      console.error("Error updating task status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    console.log(`Method ${req.method} not allowed at /api/tasks/${taskId}/status`);
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

// Helper function for date formatting
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
}
