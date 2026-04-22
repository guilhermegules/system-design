# React Container/Presenter Architecture

## Overview

This project demonstrates the **Container/Presenter** pattern (also known as Smart/Dumb components or Hooks/Views) implemented in React. This pattern separates logic-heavy components (Containers) from purely presentational components (Presenters).

## Architecture Breakdown

```
src/
├── models/Task.ts                    # MODEL - Data structure
├── containers/TaskContainer.tsx     # CONTAINER - Logic & state
└── presenters/                      # PRESENTER - Pure UI components
    ├── HeaderPresenter.tsx
    ├── TaskInputPresenter.tsx
    ├── TaskListPresenter.tsx
    └── TaskItemPresenter.tsx
```

### Model

- **Location**: `src/models/Task.ts`
- **Purpose**: Defines the data structure
- **Responsibilities**: Data shape, type definitions

### Container

- **Location**: `src/containers/TaskContainer.tsx`
- **Purpose**: Manages all logic, state, and actions
- **Responsibilities**:
  - Manage state (tasks array)
  - Implement all actions (addTask, toggleTask, deleteTask)
  - Compute derived data (stats)
  - **Uses render props pattern** - passes data to children function
- **Key Principle**: Container knows everything about the app logic

### Presenter

- **Location**: `src/presenters/`
- **Purpose**: Pure UI components with no business logic
- **Responsibilities**:
  - Render UI based on props
  - Capture user input and emit events
  - No state, no hooks, no business logic
- **Key Principle**: Presenters are completely "dumb" - they just display what they're given

## How It Works

1. **Setup**: App renders TaskContainer with a render function as children
2. **Container**: TaskContainer manages state and computes stats
3. **Render**: Container calls its children function with all necessary data
4. **Presentation**: Presenters receive data via props and render UI
5. **User Action**: User clicks delete → Presenter calls `onDelete(id)`
6. **Update**: Container's deleteTask() updates state → re-render cycle begins again

## Render Props Pattern

The Container uses the **render props** pattern:

```tsx
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
```

This provides maximum flexibility - the Container doesn't know what UI will be rendered.

## Key Characteristics

- **Complete Separation**: Containers have logic, Presenters have none
- **Render Props**: Flexible data flow via function-as-child
- **Testable**: Presenters are trivial to test (just check rendering)
- **Reusable**: Presenters can be used with different Containers
- **Explicit Contract**: Props interface defines exactly what Presenters need

## Container/Presenter vs MVVM

| Aspect         | Container/Presenter  | MVVM                   |
| -------------- | -------------------- | ---------------------- |
| Data Flow      | Render props         | Direct prop passing    |
| Presenters     | Pure UI, no hooks    | Pure UI, may use hooks |
| Container Role | Everything except UI | State + computed only  |
| Flexibility    | High (render props)  | Medium (prop drilling) |
| Complexity     | Higher (more files)  | Lower (simpler)        |

## When to Use Container/Presenter

- Large applications with complex logic
- Teams needing strict separation of concerns
- Applications requiring extensive testing
- When you want maximum reusability of UI components
- Complex apps where logic needs to be isolated from UI

## Running the Project

```bash
cd react-container
npm install
npm run dev
```
