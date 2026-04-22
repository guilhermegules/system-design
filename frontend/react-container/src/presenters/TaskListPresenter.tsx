import type { Task } from '../models/Task';
import { TaskItemPresenter } from './TaskItemPresenter';
import './TaskListPresenter.css';

export interface TaskListPresenterProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskListPresenter({ tasks, onToggle, onDelete }: TaskListPresenterProps) {
  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItemPresenter
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}