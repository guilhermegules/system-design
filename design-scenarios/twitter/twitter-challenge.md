1. Scalability
Example: Twitter Feed

Twitter needs to serve millions of users viewing and posting tweets in real time.

To scale, Twitter uses fan-out on write/read, caching (e.g., Redis), and distributed databases.

The challenge is to ensure feeds load instantly even during major events (like the Super Bowl or elections), when traffic spikes dramatically.
