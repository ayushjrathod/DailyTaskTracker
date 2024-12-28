import { deleteTaskFromDB, fetchTasksFromDB, saveTaskToDB } from "@/lib/tasks"; // Ensure all necessary functions are imported
import { Task } from "@/types/tasks";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Received ${req.method} request at /api/tasks`);

  if (req.method === "GET") {
    try {
      const tasks = await fetchTasksFromDB();
      console.log(`Fetched ${tasks.length} tasks from database`);
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error in GET handler:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  } else if (req.method === "POST") {
    try {
      const task: Task = req.body;

      // Ensure that frequency is properly structured
      if (!task.frequency) {
        task.frequency = { type: "daily" };
      } else {
        switch (task.frequency.type) {
          case "weekly":
            task.frequency.daysOfWeek = task.frequency.daysOfWeek || [];
            break;
          case "monthly":
            task.frequency.datesOfMonth = task.frequency.datesOfMonth || [];
            break;
          default:
            task.frequency = { type: "daily" };
        }
      }

      const savedTask = await saveTaskToDB(task);
      console.log("Saved new task with ID:", savedTask.id);
      res.status(201).json(savedTask);
    } catch (error) {
      console.error("Error in POST handler:", error);
      res.status(500).json({ error: "Failed to save task" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      console.log(`Deleting task with ID: ${id}`);

      if (!id || Array.isArray(id)) {
        console.error("Invalid task ID received for deletion");
        return res.status(400).json({ error: "Invalid task ID" });
      }

      await deleteTaskFromDB(id as string);
      console.log(`Deleted task with ID: ${id}`);
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error in DELETE handler:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  } else {
    console.log(`Method ${req.method} not allowed at /api/tasks`);
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
