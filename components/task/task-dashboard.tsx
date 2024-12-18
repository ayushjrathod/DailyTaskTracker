"use client";

import type { Task } from "@/types/tasks";

import { Button, Input } from "@nextui-org/react";
import { Edit3, Trash2, X, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";

import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { formatDate, getDaysArray } from "@/utils/date";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleInputVisibility = () => {
    setIsInputVisible(!isInputVisible);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const days = getDaysArray(5); // Get the last 5 days including today

  useEffect(() => {
    async function loadTasks() {
      try {
        const fetchedTasks = await fetchTasks();

        setTasks(fetchedTasks);
      } catch (error) {
        console.error(error);
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

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">Daily Tasks</h1>
          <Button size="sm" variant="ghost" onClick={toggleEditing}>
            {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Task Name</th>
                  {days.map((day) => {
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                      <th
                        key={day.toISOString()}
                        className={`py-4 text-center font-medium ${isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                      >
                        {formatDate(day)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b last:border-0">
                    <td className="p-4 flex justify-between items-center">
                      {task.name}
                      {isEditing && (
                        <Button size="sm" variant="light" onClick={() => removeTask(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                    {days.map((day) => {
                      const date = formatDate(day);
                      const status = task.status[date];
                      const isToday = day.toDateString() === new Date().toDateString();

                      return (
                        <td
                          key={day.toISOString()}
                          className={`px-20 py-4 text-center ${isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                        >
                          <CustomCheckbox
                            checked={status === "completed"}
                            id={`${task.id}-${date}`}
                            onChange={(checked) => {
                              updateTaskStatus(task.id, date, checked ? "completed" : "failed");
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isEditing && (
            <div className="flex flex-col items-center">
              <div className="flex gap-2 items-center w-full">
                <button className="bg-gray-200 dark:bg-gray-700 rounded-3xl px-6 py-2" onClick={toggleInputVisibility}>
                  {isInputVisible ? (
                    <Minus className="h-4 w-4 text-black dark:text-white" />
                  ) : (
                    <Plus className="h-4 w-4 text-black dark:text-white" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isInputVisible ? "max-h-40 opacity-100 flex w-full" : "max-h-0 opacity-0 hidden"
                  } items-center gap-2`}
                >
                  <Input
                    className="w-full"
                    placeholder="Add new task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                  />
                  <Button className="w-18" onClick={addTask}>
                    Add Task
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
