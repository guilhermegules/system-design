import { TaskContainer } from './containers/TaskContainer';
import { HeaderPresenter } from './presenters/HeaderPresenter';
import { TaskInputPresenter } from './presenters/TaskInputPresenter';
import { TaskListPresenter } from './presenters/TaskListPresenter';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="container">
        <TaskContainer>
          {({ tasks, stats, addTask, toggleTask, deleteTask }) => (
            <>
              <HeaderPresenter stats={stats} />
              <TaskInputPresenter onAdd={addTask} />
              <TaskListPresenter
                tasks={tasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            </>
          )}
        </TaskContainer>
      </div>
    </div>
  );
}

export default App;