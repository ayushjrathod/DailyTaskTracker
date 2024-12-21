"use client";

import type { Task } from "@/types/tasks";

import { Button, Input } from "@nextui-org/react";
import { Edit3, Minus, Plus, Trash2, X, Pencil } from "lucide-react"; // Import Pencil icon
import { useEffect, useState } from "react";

import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { formatDate, getDaysArray } from "@/utils/date";
import { AnimatePresence, motion } from "framer-motion";
import Loader from "@/app/loader";

async function fetchTasks() {
  const response = await fetch("/api/tasks");

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
}

export default function TasksDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskName, setEditedTaskName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleInputVisibility = () => {
    setIsInputVisible(!isInputVisible);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTaskName(task.name);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditedTaskName("");
  };

  const submitEdit = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editedTaskName }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
        setEditingTaskId(null);
        setEditedTaskName("");
      } else {
        console.error("Failed to update task:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const days = getDaysArray(5); // Get the last 5 days including today

  useEffect(() => {
    async function loadTasks() {
      try {
        setIsLoading(true);
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    if (mounted) {
      loadTasks();
    }
  }, [mounted]);

  const updateTaskStatus = async (taskId: string, date: string, status: "completed" | "failed") => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status: {
            ...task.status,
            [date]: status,
          },
        };
      }
      return task;
    });

    setTasks(updatedTasks);

    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      const task = {
        name: newTask.trim(),
        status: {},
      };

      try {
        console.log("Adding new task:", task);
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        });

        if (response.ok) {
          const savedTask = await response.json();
          console.log("Task added successfully:", savedTask);
          setTasks([...tasks, savedTask]);
          setNewTask("");
        } else {
          console.error("Failed to add task:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const removeTask = async (id: string) => {
    try {
      console.log("Deleting task:", id);
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Task deleted successfully");
        const updatedTasks = tasks.filter((task) => task.id !== id);
        setTasks(updatedTasks);
      } else {
        console.error("Failed to delete task:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Daily Tasks
          </h1>
          <Button
            size="sm"
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
            onClick={toggleEditing}
          >
            {isEditing ? <X className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="p-4 text-left font-semibold text-gray-600 dark:text-gray-200">Task Name</th>
                  {days.map((day) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <th
                        key={day.toISOString()}
                        className={`py-4 px-2 text-center font-semibold text-gray-600 dark:text-gray-200 ${
                          isToday ? "bg-blue-50 dark:bg-blue-900/40" : ""
                        }`}
                      >
                        {formatDate(day)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {tasks.map((task, index) => (
                    <motion.tr
                      key={task.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`border-b border-gray-200 dark:border-gray-700 ${
                        index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""
                      }`}
                    >
                      <td className="p-4 flex justify-between items-center">
                        {editingTaskId === task.id ? (
                          <input
                            type="text"
                            value={editedTaskName}
                            onChange={(e) => setEditedTaskName(e.target.value)}
                            className="px-2 py-1 border rounded"
                          />
                        ) : (
                          <span className="font-medium text-gray-700 dark:text-gray-300">{task.name}</span>
                        )}
                        {isEditing && (
                          <div className="flex space-x-2">
                            {editingTaskId === task.id ? (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-500 text-white hover:bg-green-600"
                                  onClick={() => submitEdit(task.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-gray-500 text-white hover:bg-gray-600"
                                  onClick={cancelEditing}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => startEditing(task)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => removeTask(task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                      {days.map((day) => {
                        const date = formatDate(day);
                        const status = task.status[date];
                        const isToday = day.toDateString() === new Date().toDateString();

                        return (
                          <td
                            key={day.toISOString()}
                            className={`px-6 py-4 text-center ${isToday ? "bg-blue-50 dark:bg-blue-900/40" : ""}`}
                          >
                            <CustomCheckbox
                              checked={status === "completed"}
                              onChange={(checked) => {
                                updateTaskStatus(task.id, date, checked ? "completed" : "failed");
                              }}
                              id={`${task.id}-${date}`}
                              onLabel="Done"
                              offLabel="Todo"
                              isToday={isToday}
                            />
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <div className="flex gap-2 items-center w-full">
                <Button
                  className="bg-gray-200 dark:bg-gray-700 rounded-full p-2 transition-all duration-300 hover:scale-110"
                  onClick={toggleInputVisibility}
                >
                  {isInputVisible ? (
                    <Minus className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                </Button>
                <AnimatePresence>
                  {isInputVisible && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "100%" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2 w-full"
                    >
                      <Input
                        className="w-full"
                        placeholder="Add new task"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTask()}
                      />
                      <Button
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                        onClick={addTask}
                      >
                        Add Task
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
