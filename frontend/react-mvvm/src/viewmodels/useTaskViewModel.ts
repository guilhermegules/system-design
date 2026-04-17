import { useState, useCallback, useMemo } from 'react';
import type { Task } from '../models/Task';

export interface TaskViewModel {
  tasks: Task[];
  completedCount: number;
  pendingCount: number;
  addTask: (text: string) => boolean;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

export function useTaskViewModel(): TaskViewModel {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return false;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      createdAt: new Date(),
    };

    setTasks(prev => [newTask, ...prev]);
    return true;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const completedCount = useMemo(() =>
    tasks.filter(t => t.completed).length,
    [tasks]
  );

  const pendingCount = useMemo(() =>
    tasks.filter(t => !t.completed).length,
    [tasks]
  );

  return {
    tasks,
    completedCount,
    pendingCount,
    addTask,
    toggleTask,
    deleteTask,
  };
}