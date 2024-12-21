"use client";

import type { Task, Frequency } from "@/types/tasks";

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
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<Frequency>({ type: "daily" });

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

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFrequency = e.target.value;
    if (selectedFrequency === "daily") {
      setFrequency({ type: "daily" });
    } else if (selectedFrequency === "weekly") {
      setFrequency({ type: "weekly", daysOfWeek: [] });
    } else if (selectedFrequency === "monthly") {
      setFrequency({ type: "monthly", datesOfMonth: [] });
    }
  };

  const handleDaysOfWeekChange = (day: string) => {
    setFrequency((prev) => {
      if (prev.type !== "weekly") return prev;
      const days = prev.daysOfWeek.includes(day) ? prev.daysOfWeek.filter((d) => d !== day) : [...prev.daysOfWeek, day];
      return { ...prev, daysOfWeek: days };
    });
  };

  const handleDatesOfMonthChange = (date: number) => {
    setFrequency((prev) => {
      if (prev.type !== "monthly") return prev;
      const dates = prev.datesOfMonth.includes(date)
        ? prev.datesOfMonth.filter((d) => d !== date)
        : [...prev.datesOfMonth, date];
      return { ...prev, datesOfMonth: dates };
    });
  };

  const submitEdit = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editedTaskName, frequency }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
        setEditingTaskId(null);
        setEditedTaskName("");
        setFrequency({ type: "daily" }); // Reset frequency
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
        frequency: frequency,
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
          setFrequency({ type: "daily" }); // Reset frequency
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

  // Helper function to check if a task is scheduled on a given date
  const isTaskScheduled = (task: Task, date: Date): boolean => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateOfMonth = date.getDate();

    // Provide a default frequency if undefined
    const frequency = task.frequency || { type: "daily" };

    console.log(`Checking schedule for task: ${task.name}, Date: ${formatDate(date)}, Frequency:`, frequency);

    switch (frequency.type) {
      case "daily":
        return true;
      case "weekly":
        return frequency.daysOfWeek.includes(dayName);
      case "monthly":
        return frequency.datesOfMonth.includes(dateOfMonth);
      default:
        return false;
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
                          <div className="flex flex-col w-full">
                            <input
                              type="text"
                              value={editedTaskName}
                              onChange={(e) => setEditedTaskName(e.target.value)}
                              className="px-2 py-1 border rounded mb-2"
                            />
                            <div className="mb-2">
                              <label className="mr-2">Frequency:</label>
                              <select
                                value={frequency.type}
                                onChange={handleFrequencyChange}
                                className="border rounded px-2 py-1"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                            {frequency.type === "weekly" && (
                              <div className="mb-2">
                                <span>Select Days of Week:</span>
                                <div className="flex flex-wrap">
                                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                                    (day) => (
                                      <label key={day} className="mr-2">
                                        <input
                                          type="checkbox"
                                          checked={frequency.type === "weekly" && frequency.daysOfWeek.includes(day)}
                                          onChange={() => handleDaysOfWeekChange(day)}
                                          className="mr-1"
                                        />
                                        {day}
                                      </label>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {frequency.type === "monthly" && (
                              <div className="mb-2">
                                <span>Select Dates of Month:</span>
                                <div className="flex flex-wrap">
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                                    <label key={date} className="mr-2">
                                      <input
                                        type="checkbox"
                                        checked={frequency.type === "monthly" && frequency.datesOfMonth.includes(date)}
                                        onChange={() => handleDatesOfMonthChange(date)}
                                        className="mr-1"
                                      />
                                      {date}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
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
                        const date = day;
                        const isToday = date.toDateString() === new Date().toDateString();
                        const scheduled = isTaskScheduled(task, date);
                        const formattedDate = formatDate(date);
                        const status = task.status[formattedDate];

                        return (
                          <td
                            key={date.toISOString()}
                            className={`px-6 py-4 text-center ${isToday ? "bg-blue-50 dark:bg-blue-900/40" : ""}`}
                          >
                            {scheduled ? (
                              <CustomCheckbox
                                checked={status === "completed"}
                                onChange={(checked) => {
                                  updateTaskStatus(task.id, formattedDate, checked ? "completed" : "failed");
                                }}
                                id={`${task.id}-${formattedDate}`}
                                onLabel="Done"
                                offLabel="Todo"
                                isToday={isToday}
                              />
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">Break</span>
                            )}
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
                      <div className="flex flex-col w-full">
                        <label className="mb-2">Frequency:</label>
                        <select
                          value={frequency.type}
                          onChange={handleFrequencyChange}
                          className="border rounded px-2 py-1 mb-2"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        {frequency.type === "weekly" && (
                          <div className="mb-2">
                            <span>Select Days of Week:</span>
                            <div className="flex flex-wrap">
                              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                                (day) => (
                                  <label key={day} className="mr-2">
                                    <input
                                      type="checkbox"
                                      checked={frequency.type === "weekly" && frequency.daysOfWeek.includes(day)}
                                      onChange={() => handleDaysOfWeekChange(day)}
                                      className="mr-1"
                                    />
                                    {day}
                                  </label>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {frequency.type === "monthly" && (
                          <div className="mb-2">
                            <span>Select Dates of Month:</span>
                            <div className="flex flex-wrap">
                              {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                                <label key={date} className="mr-2">
                                  <input
                                    type="checkbox"
                                    checked={frequency.type === "monthly" && frequency.datesOfMonth.includes(date)}
                                    onChange={() => handleDatesOfMonthChange(date)}
                                    className="mr-1"
                                  />
                                  {date}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
