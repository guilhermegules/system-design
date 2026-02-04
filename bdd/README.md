# Behaviour-Driven Development (BDD)

BDD is primarily a collaboration and design practice. Its goal is to ensure that everyone involved in building a system—developers, testers, product owners, and stakeholders—shares the same understanding of how the software should behave. Instead of starting from technical implementation, BDD starts from expected behavior, expressed in terms of user needs and business outcomes.

These behaviors are usually described in clear, structured language (often following patterns like Given–When–Then), which makes requirements concrete, testable, and less ambiguous. BDD helps prevent misunderstandings early, before code is written, by turning requirements into executable specifications.

## Functional testing

Functional testing, on the other hand, is a testing technique used to verify that the system behaves correctly from the outside. It treats the application as a black box and checks whether it produces the expected results when a user interacts with it through the UI, APIs, or other public interfaces. Functional tests focus on what the system does, not how it is implemented. They validate real workflows, integrations between components, and end-to-end behavior that unit tests cannot fully cover.

The connection between the two is that BDD defines behavior, and functional tests often verify it. A behavior described during BDD discussions can be turned into one or more functional tests that assert the system behaves as expected in real usage scenarios. While BDD is about aligning understanding and specifying intent, functional testing is about enforcing that intent in a running system.

## Conclusion

In practice, BDD helps teams build the right thing by clarifying behavior, while functional testing helps ensure the system actually does that thing when users interact with it. 
Both complement unit tests, which focus on internal correctness, creating a more complete and reliable testing strategy.
