# Object Calisthenics

> These rules are training wheels: they push you toward better object design, not dogma.

## One Level of Indentation per Method

> A method should have at most one indentation level.

```typescript
// ❌ Bad
function calculateTotal(items: number[]) {
  if (items.length > 0) {
    for (const item of items) {
      if (item > 0) {
        console.log(item);
      }
    }
  }
}

// ✅ Good
function calculateTotal(items: number[]) {
  if (items.length === 0) return;

  logPositiveItems(items);
}

function logPositiveItems(items: number[]) {
  items.filter((item) => item > 0).forEach((item) => console.log(item));
}
```

Why

- Deep nesting hides intent
- Increases cognitive load
- Usually means the method does too

What It Forces

- Smaller methods
- Clear naming
- Functional-style operations (map, filter)

When to Use

- Business logic
- Domain rules
- Services and use cases

When to Relax

- Performance-critical low-level loops
- Simple guards that don’t obscure intent

## Don't Use the else keyword

> Avoid else by using early returns.

```typescript
// ❌ Bad
function getDiscount(price: number): number {
  if (price > 100) {
    return 10;
  } else {
    return 0;
  }
}

// ✅ Good
function getDiscount(price: number): number {
  if (price > 100) return 10;
  return 0;
}
```

Why

- else increases nesting
- Forces readers to keep both branches in mind

What It Forces

- Guard clauses
- Linear reading flow

When to Use

- Validation logic
- Command handlers
- API controllers

When to Relax

- Simple conditional expressions
- Pattern matching / switch expressions

## Wrap All Primitives and Strings

> Replace primitives with value objects.

```typescript
// ❌ Bad
class User {
  constructor(public name: string, public age: number) {}
}

// ✅ Good
class UserName {
  constructor(private value: string) {
    if (!value) throw new Error("Name required");
  }

  toString() {
    return this.value;
  }
}

class Age {
  constructor(private value: number) {
    if (value < 0) throw new Error("Invalid age");
  }

  getValue() {
    return this.value;
  }
}

class User {
  constructor(public name: UserName, public age: Age) {}
}
```

Why

- Primitives have no meaning
- Validation is duplicated everywhere
- Invalid states are easy

What It Forces

- Explicit domain language
- Centralized validation
- Strong invariants

When to Use

- Domain models
- Business rules
- Financial, identity, or validation-heavy data

When to Relax

- DTOs
- Serialization boundaries
- Performance-sensitive hot paths

## Use First-Class Collections

> Collections should be wrapped in their own class.

```typescript
// ❌ Bad
class Order {
  constructor(public items: string[]) {}
}

// ✅ Good
class Items {
  constructor(private items: string[]) {}

  count() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

class Order {
  constructor(private items: Items) {}
}
```

Why

- Logic leaks everywhere
- Duplicated rules (empty, max, valid)
- Hard to enforce constraints

What It Forces

- Behavior close to data
- Expressive APIs

When to Use

- Aggregates
- Domain collections
- Business constraints

When to Relax

- Simple read-only lists
- UI view models

## One Dot per Line (Law of Demeter)

> Avoid chaining calls across objects.

```typescript
// ❌ Bad
order.getCustomer().getAddress().getCity();
// ✅ Good
order.getCustomerCity();

class Order {
  constructor(private customer: Customer) {}

  getCustomerCity() {
    return this.customer.city();
  }
}
```

Why

- High coupling
- Object graph leakage
- Fragile changes

What It Forces

- Objects to own their behavior
- Message passing instead of navigation

When to Use

- Domain logic
- Core business flows

When to Relax

- DTOs
- Mapping layers
- Fluent APIs

## Don’t Abbreviate

> Use full, expressive names.

```typescript
// ❌ Bad
class UsrSvc {
  getUsr() {}
}

// ✅ Good
class UserService {
  getUser() {}
}
```

Why

- Code is read more than written
- Abbreviations are ambiguous
- Slows onboarding

What It Forces

- Clear intent
- Shared vocabulary

When to Use

- Everywhere

When to Relax

- Well-known math symbols (x, i)
- Local short-lived variables

## Keep All Entities Small

> Classes should be small and focused.

```typescript
// ❌ Bad
class UserManager {
  createUser() {}
  deleteUser() {}
  sendEmail() {}
  logActivity() {}
}

// ✅ Good
class UserCreator {
  create() {}
}

class UserDeleter {
  delete() {}
}

class EmailSender {
  send() {}
}
```

Why

- Large classes hide responsibilities
- Hard to test and change
- High coupling

What It Forces

- Single Responsibility Principle
- Composability

When to Use

- Domain services
- Application services

When to Relax

- Infrastructure adapters
- Framework glue code

## No Classes with More Than Two Instance Variables

> Limit instance variables to two.

```typescript
// ❌ Bad
class Rectangle {
  constructor(
    private width: number,
    private height: number,
    private color: string
  ) {}
}

// ✅ Good
class Size {
  constructor(public width: number, public height: number) {}
}

class Rectangle {
  constructor(private size: Size, private color: string) {}
}
```

Why

- Many fields = many responsibilities
- Encourages anemic data structures

What It Forces

- Composition
- Rich value objects
- Better abstractions

When to Use

- Domain entities
- Value objects

When to Relax

- DTOs
- Persistence models
- Performance-critical structs

## No Getters / Setters (Tell, Don’t Ask)

> Don’t expose state; expose behavior.

```typescript
// ❌ Bad
if (account.getBalance() > 0) {
  account.setBalance(account.getBalance() - 10);
}

// ✅ Good
account.withdraw(10);

class Account {
  constructor(private balance: number) {}

  withdraw(amount: number) {
    if (amount > this.balance) return;
    this.balance -= amount;
  }
}
```

Why

- Protects invariants
- Prevents procedural code
- Keeps logic where data lives

What It Forces

- Rich domain objects
- Encapsulation

When to Use

- Domain models
- Business rules

When to Relax

- Serialization
- UI binding
- Immutable data structures

## Summary

Object Calisthenics is not about rules, it’s about pressure. Each rule pushes design toward:

- Smaller objects
- Better encapsulation
- Explicit domain language
- Lower coupling

Break the rules intentionally, not accidentally.
