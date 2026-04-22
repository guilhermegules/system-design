# React MVC Architecture Demo

## Overview

This project demonstrates the **Model-View-Controller (MVC)** pattern implemented in React. MVC is a classic architectural pattern that separates an application into three interconnected components.

## Architecture Breakdown

```
src/
├── models/Task.ts                    # MODEL - Data structure
├── controllers/useTaskController.ts  # CONTROLLER - Business logic
└── views/                            # VIEW - UI components
    ├── TaskInput.tsx
    ├── TaskList.tsx
    └── TaskItem.tsx
```

### Model

- **Location**: `src/models/Task.ts`
- **Purpose**: Defines the data structure (Task interface)
- **Responsibilities**: Data shape, type definitions, no business logic

### View

- **Location**: `src/views/`
- **Purpose**: React functional components that render UI
- **Responsibilities**: Display data, capture user input, emit events
- **Key Principle**: Views should be "dumb" - they only render based on props

### Controller

- **Location**: `src/controllers/useTaskController.ts`
- **Purpose**: Custom React hook managing business logic
- **Responsibilities**:
  - Manage state (tasks array)
  - Implement actions (addTask, deleteTask)
  - Process user requests
  - Update model/view as needed

## How It Works

1. **User Action**: User types in input and clicks "Add"
2. **View**: TaskInput component captures input and calls `onAdd`
3. **Controller**: useTaskController.addTask() processes the action
4. **State Update**: Controller updates the tasks state
5. **Re-render**: React automatically re-renders views with new data

## Key Characteristics

- **Separation of Concerns**: Each layer has distinct responsibilities
- **Direct Communication**: Controller mediates between Model and View
- **State in Controller**: React hooks handle state management
- **Simple & Direct**: Straightforward flow of control

## When to Use MVC in React

- Small to medium applications
- Teams familiar with traditional MVC patterns
- When you need clear role separation without complex state management
- Prototyping and learning React patterns

## Running the Project

```bash
cd react-mvc
npm install
npm run dev
```
