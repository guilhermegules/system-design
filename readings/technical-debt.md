# Technical Debt

- Make better engineering tradeoffs
- Move fast without creating long-term drag
- Talk about technical debt in a clear, shared way
- Inspired by ideas from Martin Fowler and Robert C. Martin.

## 1. What Technical Debt Means (For Us)

Technical Debt is:

> A conscious tradeoff to gain speed today by accepting future cost.

It is not:

- Bad code
- Legacy code
- Bugs
- A messy system

Debt only exists when there was a **decision**.

**If no decision was made it's likely a mess, not debt.**

## 2. Not All Debt Is Bad

| Type                      | Description                         | Acceptable? |
| ------------------------- | ----------------------------------- | ----------- |
| Prudent + Deliberate      | Strategic shortcut to meet a goal   | YES         |
| Prudent + Inadvertent     | We learned better later             | NORMAL      |
| Reckless + Deliberate     | We ignored best practices knowingly | NO          |
| Reckless + Inadvertent    | Skill gap / lack of understanding   | IMPROVE     |

## 3. A Mess Is Not Debt

Debt = Decision
Mess = Neglect

| Situation                        | Classification |
| -------------------------------- | -------------- |
| MVP shortcut with follow-up plan | Debt           |
| No tests because “later”         | Mess           |
| Poor design due to learning      | Learning debt  |
| Repeated hacks with no ownership | Mess           |

## 4. The Design Reality

| Approach    | Short-Term      | Long-Term  |
| ----------- | --------------- | ---------- |
| No design   | Fast            | Slows down |
| Good design | Slightly slower | Stays fast |

Eventually, good design always wins

This is called **[Design Stamina](https://martinfowler.com/bliki/DesignStaminaHypothesis.html)**.

## 5. The Payoff Moment

There is a tipping point where:

- Shortcuts stop helping and start hurting

This happens sooner than expected.

After this point:
- Every new feature becomes harder
- Bugs increase
- Delivery slows down

## 6. Productivity Is Not Precisely Measurable

We cannot accurately measure:
- Code quality
- True productivity
- Exact debt cost

So, engineering decisions require **judgment**, not just metrics.

## 7. Our Team Principles

We Accept:

- Strategic shortcuts
- Learning-driven redesign
- Iterative architecture

We Avoid:

- Lazy decisions
- "We'll fix later" without a plan
- Unknown debt
- Permanent hacks

## 8. How We Manage Debt

When taking debt, we:

- Acknowledge, Document, Track and Revisit it
- Debt must have:
  - A reason
  - An owner
  - A future resolution path
 
## References

- [Technical Debt](https://martinfowler.com/bliki/TechnicalDebt.html)
- [Technical Debt Quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html)
- [Design Payoff Line](https://martinfowler.com/bliki/DesignPayoffLine.html)
- [Design Stamina Hypothesis](https://martinfowler.com/bliki/DesignStaminaHypothesis.html)
- [A Mess is not a Technical Debt.](https://sites.google.com/site/unclebobconsultingllc/a-mess-is-not-a-technical-debt)
- [Cannot Measure Productivity](https://martinfowler.com/bliki/CannotMeasureProductivity.html)
