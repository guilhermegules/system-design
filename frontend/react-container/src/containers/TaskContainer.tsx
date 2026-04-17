import { useState, useCallback, useMemo } from 'react';
import type { Task, TaskStats } from '../models/Task';

export interface TaskContainerProps {
  children: (props: TaskContainerRenderProps) => React.ReactNode;
}

export interface TaskContainerRenderProps {
  tasks: Task[];
  stats: TaskStats;
  addTask: (text: string) => boolean;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  isLoading: boolean;
}

export function TaskContainer({ children }: TaskContainerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const isLoading = false;

  const stats = useMemo<TaskStats>(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
  }), [tasks]);

  const addTask = useCallback((text: string): boolean => {
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

  return children({
    tasks,
    stats,
    addTask,
    toggleTask,
    deleteTask,
    isLoading,
  });
}