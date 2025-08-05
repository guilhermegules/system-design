3. Consistency vs Availability (CAP Theorem)
Example: Amazon Shopping Cart

When you add an item to your cart, you expect it to be available across all devices (consistency).

However, during network partition or server issues, Amazon might prioritize availability over strict consistency using eventual consistency.

They use DynamoDB, which allows tunable consistency based on the use case.
