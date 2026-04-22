# Frontend Architecture

## Why Frontend Architecture Matters

Frontend architecture is the foundation of maintainable, scalable, and performant web applications. It defines how code is organized, data flows and components interact.

### User Experience Directly Depends on It

- **Performance**: Good architecture reduces render cycles, minimizes bundle size, and optimizes loading times
- **Maintainability**: Clean architecture makes it easier for teams to understand, modify, and extend code
- **Testing**: Well-architected code is easier to unit test, integration test, and E2E test
- **Collaboration**: Clear patterns enable multiple developers to work on the same codebase without conflicts

### The Browser is a Unique Environment

Frontend runs in a completely different environment than backend:

- **Limited resources**: Mobile devices, varying hardware capabilities
- **Network constraints**: Variable bandwidth, offline scenarios
- **Security model**: Sandboxed environment with restricted APIs
- **User interaction**: Real-time input, animations, instant feedback expectations

## How Frontend Architecture Differs from Backend

### Execution Model

| Aspect  | Backend                       | Frontend                    |
| ------- | ----------------------------- | --------------------------- |
| Runtime | Server-side (Node, JVM, etc.) | Browser (JavaScript engine) |
| State   | Persistent databases          | Ephemeral in-memory state   |
| Scale   | Server handles many users     | Each user has own instance  |
| Latency | Fast DB queries               | Network round-trips         |

### Data Flow

**Backend:**

- Request -> Controller -> Service -> Repository -> Database
- Synchronous, blocking operations
- State persists across requests

**Frontend:**

- User Action -> Component -> State -> Re-render -> UI Update
- Asynchronous, event-driven
- State resets on refresh (unless persisted)

### Complexity Sources

**Backend Complexity:**

- Database design and optimization
- API design and versioning
- Authentication and authorization
- Concurrency and race conditions
- Deployment and scaling

**Frontend Complexity:**

- UI state management across components
- Rendering optimization (re-renders, virtual DOM)
- Browser compatibility
- Performance (bundle size, lazy loading)
- User interaction patterns

### Architectural Patterns

**Backend Patterns:**

- MVC, Layered Architecture, Hexagonal, DDD, CQRS
- Focus on data persistence, business rules, API design

**Frontend Patterns:**

- MVC, MVVM, Container/Presenter, Atomic Design
- Focus on UI composition, state management, rendering

### Key Differences Summary

1. **State is ephemeral**: Frontend state disappears on refresh; backend state persists
2. **User-specific**: Each user gets their own frontend instance; backend serves many
3. **Rendering matters**: Frontend must optimize for paint/reflow; backend doesn't render
4. **Network awareness**: Frontend deals with latency; backend assumes fast internal networks
5. **Testability**: Frontend tests DOM/React tree; backend tests business logic/services

## Demo Projects Overview

This folder contains three frontend architecture patterns:

### 1. MVC (Model-View-Controller)

- **Model**: Data structures
- **View**: React components
- **Controller**: Custom hooks with business logic

Best for: Simple applications, learning React patterns

### 2. MVVM (Model-View-ViewModel)

- **Model**: Data structures
- **ViewModel**: State + computed properties (via hooks)
- **View**: React components

Best for: Applications with derived/calculated state

### 3. Container/Presenter

- **Model**: Data structures
- **Container**: Logic + state (render props)
- **Presenter**: Pure UI components

## Micro Frontends (MFE)

Micro Frontends extend the microservices philosophy to the frontend, decomposing a monolithic frontend into smaller, independently developable and deployable applications.

### Core Principles

- **Independent Deployment**: Each micro frontend can be deployed without coordinating with other teams
- **Technology Agnostic**: Different teams can use different frameworks (React, Vue, Angular)
- **Domain Ownership**: Each team owns a specific business domain
- **Isolation**: Styles and JavaScript are isolated to avoid conflicts

### Architecture Patterns

1. **Module Federation**: Webpack 5 feature allowing shared code at runtime
2. **iframe**: Complete isolation but limited communication
3. **Web Components**: Standards-based component sharing
4. **Single-SPA**: Framework for coordinating multiple applications

### Trade-offs

| Benefits | Challenges |
| -------- | ---------- |
| Independent teams | Shared dependencies bloat |
| Faster iteration | Inconsistent user experience |
| Technology flexibility | Complex integration |
| Selective deployment | Performance overhead |

## Resources

- [React Documentation](https://react.dev)
- [What is frontend architecture](https://ducin.dev/what-is-frontend-architecture)
- [Redux](https://redux.js.org/introduction/getting-started)
- [MFE Playground](https://github.com/guilhermegules/mfe-playground)
