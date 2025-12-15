# Observer Design Pattern

The observer design pattern is a behavioral design pattern that lets one object (called commonly as subject) notify many other objects (called commonly as Observers) automatically whenever its state changes.

## Key concepts

- **Subject**, the component that holds information or state
- **Register/Attach**, Observer _subscribe_ to the subject to receive updates.
- **Event**, a trigger inside the subject that indicates something changed
- **Notify**, The mechanism where the subject informs observers; this can be implement as either:
  - **Push**: Subject sends data.
  - **Pull**: Observers request data.
- **Update**, observers update their own state based on the notification.

## How it works (Simplified)

- Observers register with the subject when they are created
- The subject maintains list of its observers internally
- When something changes (an event), the Subject calls `notify()`
- `notify()` loops through all observers and calls their `update()` methods.

## Simple example

- A game is the subject
- Supporters are observers
- When the team scores, the subject notifies all supporters
- Each supporter updates its own behavior

## Benefits

- Lose coupling, the subject only depends on an interface, not specific observer implementation
- Extensibility, you can add or remove observers at runtime
- Independent behavior, observers update based on their own logic

## Common implementations

- Java (deprecated `java.util.Observer` / `Observable`)
- Python (`pip install pattern-observer`)
- C++ with libraries with like Boost Signals
- JavaScript (RxJS)

## Summary

he Observer Pattern is used to create a one-to-many relationship between objects so that when one object changes, all interested objects are notified and can respond automatically. The key idea is to loosen coupling between components: the subject doesn’t need to know details about its observers, just that they implement an update interface. This makes systems easier to extend and modify because observers can be added or removed dynamically without changing the core subject logic.
