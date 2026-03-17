# Demeter's Law

The Law of Demeter says:

> An object should only talk to its “close friends,” not strangers.

In code, that means a method should only call:

- Its own methods
- Methods of objects passed to it
- Methods of objects it creates
- Its direct components (its fields)

## Breaking the rule

```java
order.getCustomer().getAddress().getCity();
```

Why this is bad:

- The order object is reaching through multiple layers (customer -> address -> city)
- It depends on the internal structure of other objects
- If anything changes (like how address is stored), this line breaks

## Following the rule

```java
order.getCustomerCity();
```

inside the Order class:

```java
public String getCustomerCity() {
  return customer.getAddress().getCity();
}
```

Why this is better:

- The complexity is hidden inside the class
- Other parts of the program don’t need to know internal details

## Why it matters

Following the Law of Demeter helps:

- Reduce coupling (objects depend less on each other)
- Improve maintainability (easier to change code later)
- Increase readability (cleaner, simpler method calls)
- Avoid “train wreck” code (long chains of calls)

## “Train wreck” warning

Code like this:

```java
a.getB().getC().getD().doSomething();
```

is often called a train wreck and it usually violates the Law of Demeter.

## Links 

- [Law of Demeter](https://en.wikipedia.org/wiki/Law_of_Demeter)
