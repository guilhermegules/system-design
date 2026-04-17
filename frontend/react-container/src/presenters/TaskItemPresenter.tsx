import type { Task } from '../models/Task';
import './TaskItemPresenter.css';

export interface TaskItemPresenterProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItemPresenter({ task, onToggle, onDelete }: TaskItemPresenterProps) {
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <label className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <span className="checkmark"></span>
      </label>
      <span className={`task-text ${task.completed ? 'completed' : ''}`}>
        {task.text}
      </span>
      <button
        className="task-delete-btn"
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  );
}