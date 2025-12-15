# Architecture and Design Patterns

## OO Modeling > OO Language

Software modeling is critical, regardless of what your choices are (eg technology, framework, or language paradigm). Modeling means taking a real-world, usually very complex, problem and turning it into a simpler set of definitions that then allow us to talk about and manipulate the problem.

A good abstraction, again, is not just the one with low coupling and high cohesion, but one that helps us to be precise about what we are talking about.

> "The purpose of abstraction is not about being vague, but about creating a new level of semantics where we can be absolutely precise." -- Edsger Dijkstra

Modeling is and always will be at a high level. That's why the most important works in the area (for example, David Parnas, Grady Booch, Bertrand Meyer, Eric Evans) are done by people practically ignorant in relation to programming languages. After all, you don't need them for modeling.

> Design patterns explained and implemented

## What's a design pattern?

**Design patterns** are typical solutions to commonly occurring problems in software design. They are like pre-made blueprints that you can customize to solve a recurring design problem in your code.

Patterns are often confused with algorithms, because both concepts describe typical solutions to some known problems. While an algorithm always defines a clear set of actions that can achieve some goal, a pattern is a more high-level description of a solution. The code of the same pattern applied to two different programs may be different.

> An analogy to an algorithm is a cooking recipe: both have clear steps to achieve a goal. On the other hand, a pattern is more like a blue print: you can see what the result and its features are, but the exact order of implementation is up to you.

## What does the pattern consist of?

Most patterns are described very formally so people can reproduce them in many contexts. Here are the sections are usually present in a pattern description:

- **Intent** of the pattern briefly describes both the problem and the solution;
- **Motivation** futher explains the problem and the solution the pattern makes possible;
- **Structure** of classes shows each part of the pattern and how they are related.

## Classification of patterns

Design patterns differ by their complexity, level of detail and scale of applicability to the entire system being designed. A good analogy would be that of a construction of a street: you can make an intersection safer by either installing some traffic lights or buiding an entire multi-level interchange with underground passages for pedestrians.

The most basic and low-level patterns are often called _idioms_. They usually apply only to a single programming language.

The most universal and high-level patterns are _architectural patterns_. Developers can implment these patterns in virtually any language. Unlike other patterns, they can be used to design the architecture of an entire application.

In addition, all patterns can be categorized by their _intent_ or purpose.

- **Creational patterns** provide object creation mechanisms that increase flexbility and reuse of existing code.
- **Stuctural patterns** explain how to assemble objects and classes into larger strucutures, while keeping the structures flexible and efficient.
- **Behavioral patterns** take care of effective communication and the assignment of responsabilities between objects.

## Why should I learn patterns?

- Design patterns are a toolkit of **tried and tested solutions** to common problems in software design. Event if you never encounter these problems, knowing patterns is still useful because it teaches you how to solve all sorts of problems unsing principles of object-oriented design;
- Design patterns define a common language that you and your teammates can use to communicate more efficiently. You can say, "Oh, just use a Singleton for that", and everyone will understand the idea behind your suggestion. No need to explain what is a singleton is if you know the pattern and its name.

#### Examples from [refactoring.guru](https://refactoring.guru/)
