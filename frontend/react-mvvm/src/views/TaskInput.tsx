import { useState } from 'react';
import './TaskInput.css';

interface TaskInputProps {
  onAdd: (text: string) => boolean;
}

export function TaskInput({ onAdd }: TaskInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd(text)) {
      setText('');
    }
  };

  return (
    <form className="task-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add a new task..."
        className="task-input-field"
      />
      <button type="submit" className="task-input-btn">
        Add
      </button>
    </form>
  );
}