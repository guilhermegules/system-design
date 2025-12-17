# What S.O.L.I.D is

SOLID is an acronym for five foundation principles of object-oriented design introduces by Robert C. Martin. These principles help make software more maintainable, extensible, testable, and robust as it grows. Each principle guides hot to structure classes and modules to reduce, coupled, fragile code.

## The Principles

### 1. Single-Responsibility Principle (SRP)

> A class should have only one reason to change, one responsibility. If a class does more than one job, it becomes harder to maintain because changes to one concern can affect the other. The article shows how separating logic from output formatting makes code cleaner and easier to extend.

### 2. Open-Closed Principle (OCP)

> Software entities should be open for extension but closed for modification. You should be able to add new behavior (like supporting new shapes) without modifying existing code. Using abstractions/interfaces lets you extend functionality without changing the original classes.

### 3. Liskov Substitution Principle (LSP)

> Subtypes must be replaceable for their base types without altering correctness. In practical terms, this means that subclasses should behave consistently with the expectations set by their parent class/interface so replacing one with another doesn't break the program.

### 4. Interface Segregation Principle (ISP)

> Clients should not be forced to depend on methods they don't use. Large, general interfaces should be split into smaller ones. For example, a 2D shape class shouldn't have to implement a volume() method if it only needs area(). This leads to more focused and flexible abstractions.

### 5. Dependency Inversion Principle (DIP)

> High-level modules should not depend on low-level modules directly, both should depend on abstractions instead. This decouples components so details (like database connectivity) are abstracted behind interfaces, making high-level logic easier to reuse and test.

## Why SOLID matters?

Adopting SOLID helps teams build systems that are:

- Easier to maintain and extend
- More modular and understandable
- Simpler to test
- Less prone to bugs when evolving requirements
