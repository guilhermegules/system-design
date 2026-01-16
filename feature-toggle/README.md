# Feature Toggle

Feature toggles are a development technique that lets you turn features on or off without changing the code itself. Instead of shipping code only when a feature is fully finished, you integrate it into your main codebase and use a toggle (like a switch) to control whether users can see or use it at runtime.

## Why They Matter

Decouple deployment from release: You can deploy code to production even if a feature isn’t ready for users yet. You release it later by flipping the toggle.

Support Continuous Delivery: Helps teams keep code in the main branch and deploy often without risky merges or long-lived branches.

Flexible control: You can enable features gradually (e.g., just for internal users, or a subset of users), test in production, or roll back quickly if something goes wrong.

## A Simple Mental Model

- Instead of: `deploy -> publish feature`
- You get: `deploy -> toggle feature on/off`

That means the code can safely live in production, and the feature is controlled by configuration, not by waiting for a separate release.

## Types of toggles

### Short-Lived Feature Toggles

- Purpose: Help with development and deployment
- Lifetime: Days or weeks
- Rule: Must be removed once the feature is stable

**Release Toggle (Classic Example)**

Used to hide an unfinished feature in production.

```js
if (featureFlags.newCheckout) {
  renderNewCheckout();
} else {
  renderOldCheckout();
}
```

Scenario

- New checkout flow is under development
- Code is deployed to main
- Feature stays OFF in production
- When ready add toggle ON
- Old code removed soon after
- Enables continuous delivery
- Must be cleaned up quickly

**Kill Switch Toggle**

Used to quickly disable a feature if something breaks.

```js
if(featureFlags.recommendationsEnabled) {
    showRecommendations(user)
}
```

Scenario

- Recommendations cause performance issues
- Toggle OFF instantly without redeploy
- Fix issue add toggle ON again
- Remove toggle after confidence is restored
- Safety mechanism
- Should not become permanent

**A/B Testing Toggle (Short Experiment)**

Used temporarily to compare behaviors.

```js
if (featureFlags.newSearchAlgorithm) {
  searchV2(query)
} else {
  searchV1(query)
}
```

Scenario

- Testing two algorithms for 2 weeks
- Collect metrics
- Pick winner
- Delete losing path and toggle
- Data-driven decisions
- Dangerous if left behind

### Long-Lived Feature Toggles

- Purpose: Business or product behavior
- Lifetime: Months or years
- Rule: Designed to stay and evolve

**Permission / Role-Based Toggle**

Feature depends on user type.

```js
if (user.isAdmin) {
  showAdminDashboard();
}
```

Scenario

- Admins see extra features
- Regular users never will
- This logic is permanent
- Legitimate long-term toggle
- Part of business rules

**Tier / Subscription-Based Feature**

Feature depends on plan level.

```js
if (user.plan === "premium") {
  enableAdvancedReports();
}
```

Scenario

- Free vs Premium features
- Toggle lives as long as pricing model exists
- Core product behavior
- Not technical debt

**Regional / Legal Toggle**

Feature depends on country or regulation.

```js
if (user.country !== "DE") {
  enableTracking();
}
```

Scenario

- GDPR restrictions
- Feature permanently disabled in certain regions
- Necessary for compliance
- Explicit and intentional

## Key Difference

> Short-lived toggles exist to support development and should be removed.

> Long-lived toggles exist to support the business and should be designed.

## Important Notes

- They introduce flexible feature control but also extra complexity (tracking toggles, avoiding dead code, managing toggle logic).
- Different kinds of toggles exist (e.g., short-lived ones for releases vs. long-lived ones for business purposes), but the unifying point is runtime feature control without code changes.

## Resources

- [Feature Toggles (aka Feature Flags)](https://www.martinfowler.com/articles/feature-toggles.html)
