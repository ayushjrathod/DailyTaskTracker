import { MongoClient, ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

async function fetchTasksFromDB() {
  try {
    const client = await clientPromise;
    const database = client.db("dailytasktracker");
    const tasksCollection = database.collection("tasks");
    const tasks = await tasksCollection.find({}).toArray();
    console.log("Fetched tasks from database");
    return tasks.map((task) => ({
      id: task._id.toString(),
      name: task.name,
      status: task.status,
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

async function saveTaskToDB(task) {
  try {
    const client = await clientPromise;
    const database = client.db("dailytasktracker");
    const tasksCollection = database.collection("tasks");
    const result = await tasksCollection.insertOne(task);
    console.log("Task saved to database:", result.insertedId);
    return {
      id: result.insertedId.toString(),
      name: task.name,
      status: task.status,
    };
  } catch (error) {
    console.error("Error saving task:", error);
    throw error;
  }
}

async function deleteTaskFromDB(id) {
  try {
    const client = await clientPromise;
    const database = client.db("dailytasktracker");
    const tasksCollection = database.collection("tasks");
    const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
    console.log(`Task deleted from database (${id}):`, result.deletedCount);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const tasks = await fetchTasksFromDB();
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  } else if (req.method === "POST") {
    try {
      const task = req.body;
      console.log("Received task to save:", task);
      const savedTask = await saveTaskToDB(task);
      res.status(201).json(savedTask);
    } catch (error) {
      console.error("Error in POST handler:", error);
      res.status(500).json({ error: "Failed to save task" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      console.log("Received task ID to delete:", id);
      await deleteTaskFromDB(id);
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error in DELETE handler:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
