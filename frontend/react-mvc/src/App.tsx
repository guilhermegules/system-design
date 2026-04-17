import { useTaskController } from "./controllers/useTaskController";
import { TaskInput } from "./views/TaskInput";
import { TaskList } from "./views/TaskList";
import "./App.css";

function App() {
  const {
    tasks,
    completedCount,
    pendingCount,
    addTask,
    toggleTask,
    deleteTask,
  } = useTaskController();

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Task Manager</h1>
          <div className="task-stats">
            <span className="stat pending">{pendingCount} pending</span>
            <span className="stat completed">{completedCount} done</span>
          </div>
        </header>

        <TaskInput onAdd={addTask} />
        <TaskList tasks={tasks} onDelete={deleteTask} onToggle={toggleTask} />
      </div>
    </div>
  );
}

export default App;
