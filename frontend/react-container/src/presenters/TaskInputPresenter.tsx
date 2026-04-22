import './TaskInputPresenter.css';

export interface TaskInputPresenterProps {
  onAdd: (text: string) => boolean;
}

export function TaskInputPresenter({ onAdd }: TaskInputPresenterProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('taskInput') as HTMLInputElement;
    if (onAdd(input.value)) {
      input.value = '';
    }
  };

  return (
    <form className="task-input" onSubmit={handleSubmit}>
      <input
        type="text"
        name="taskInput"
        placeholder="Add a new task..."
        className="task-input-field"
      />
      <button type="submit" className="task-input-btn">
        Add
      </button>
    </form>
  );
}