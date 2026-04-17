# React MVVM Architecture Demo

## Overview

This project demonstrates the **Model-View-ViewModel (MVVM)** pattern implemented in React. MVVM extends MVC by introducing a "ViewModel" layer that acts as an abstraction between the View and Model, providing data transformation and computed properties.

## Architecture Breakdown

```
src/
├── models/Task.ts                    # MODEL - Data structure
├── viewmodels/useTaskViewModel.ts    # VIEWMODEL - State + computed properties
└── views/                            # VIEW - UI components
    ├── TaskInput.tsx
    ├── TaskList.tsx
    └── TaskItem.tsx
```

### Model

- **Location**: `src/models/Task.ts`
- **Purpose**: Defines the data structure
- **Responsibilities**: Data shape, type definitions

### ViewModel

- **Location**: `src/viewmodels/useTaskViewModel.ts`
- **Purpose**: Bridges View and Model, transforms data for display
- **Responsibilities**:
  - Manage state (tasks array)
  - Implement actions (addTask, toggleTask, deleteTask)
  - **Compute derived state** (completedCount, pendingCount)
  - Data transformation for View consumption

### View

- **Location**: `src/views/`
- **Purpose**: React components that render UI
- **Responsibilities**: Display data, capture input, emit events
- **Key Principle**: Receives ready-to-use data from ViewModel

## How It Works

1. **User Action**: User toggles a task checkbox
2. **View**: TaskItem component calls `onToggle(id)`
3. **ViewModel**: toggleTask() updates the task's completed state
4. **Computed Properties**: React's useMemo automatically recalculates completedCount/pendingCount
5. **Re-render**: View receives updated tasks and stats from ViewModel

## Key Characteristics

- **ViewModel as Data Transformer**: Transforms raw data into View-friendly format
- **Computed/Derived State**: ViewModel exposes calculated values (counts, filtered lists)
- **Two-way-ish Binding Feel**: Actions flow to ViewModel, transformed data flows back to View
- **Enhanced State Management**: More sophisticated than plain MVC

## MVVM vs MVC

| Aspect              | MVC                            | MVVM                           |
| ------------------- | ------------------------------ | ------------------------------ |
| State Management    | Direct state in Controller     | State + computed in ViewModel  |
| Derived Data        | Computed in View or Controller | Exposed as computed properties |
| Data Transformation | Views may transform data       | ViewModel transforms data      |
| Complexity          | Simpler                        | More abstractions              |

## When to Use MVVM in React

- Medium to large applications
- When you need computed/derived state (counts, filters, aggregations)
- Complex form handling with validation
- When you want Views to remain "dumb"
- Building scalable applications with clear data flow

## Running the Project

```bash
cd react-mvvm
npm install
npm run dev
```
