import type { TaskStats } from '../models/Task';
import './HeaderPresenter.css';

export interface HeaderPresenterProps {
  stats: TaskStats;
}

export function HeaderPresenter({ stats }: HeaderPresenterProps) {
  return (
    <header className="header">
      <h1>Task Manager</h1>
      <div className="task-stats">
        <span className="stat pending">{stats.pending} pending</span>
        <span className="stat completed">{stats.completed} done</span>
      </div>
    </header>
  );
}