# Availability

> Availability measures how often your system is operational and accessible to users. A highly available system continues functioning even when individual components fail.

One important distinction, **availability** is not the same as **reliability**. A system can be highly available but unreliable.

## Measuring Availability

Availability is typically expressed as a percentage of uptime over a given period

```
Availability = Uptime / (Uptime + Downtime)
```

For example, if a system was up for 364 days and down for 1 day in a year: `Availability = 364 / 365 = 99.73%`

## The "nines" of availability

Availability is often described in terms of "nines." Each additional nine dramatically reduces allowed downtime:

| Availability             | Downtime per Year| Downtime per Month | Downtime per Week |
|--------------------------|------------------|--------------------|-------------------|
| 99% (two nines)          | 3.65 days        | 7.3 hours          | 1.68 hours        |
| 99.9% (three nines)      | 8.76 hours       | 43.8 minutes       | 10.1 minutes      |
| 99.99% (four nines)      | 52.6 minutes     | 4.38 minutes       | 1.01 minutes      |
| 99.999% (five nines)     | 5.26 minutes     | 26.3 seconds       | 6.05 seconds      |
| 99.9999% (six nines)     | 31.5 seconds     | 2.63 seconds       | 0.6 seconds       |

## Availability in Series vs Parallel

How you combine components dramatically affects overrall availability

## Components in Series

When components are in series, meaning all must work for the system to function, availability multiplies:

```
Web server (99.9%) -> App Server (99.9%) -> Database (99.9%)
```

Overall = 99.9% * 99.9% * 99.9% = 99.7%

Each component in the chain reduces overall availability. You started with three components, each at "three nines," but the combined system is below three nines. 
Add more components in series, and availability keeps dropping.

## Components in Parallel

When components are in parallel, meaning any can handle the request, availability improves dramatically:

```
Load balancer -> Server 1 (99.9%)
              -> Server 2 (99.9%)
```

For both servers to be down simultaneously, both must fail at the same time:

**Failure probability = 0.1% × 0.1% = 0.0001%**

**Availability = 100% - 0.0001% = 99.9999%**

Two servers with 99.9% availability each give you nearly six nines when running in parallel.

## Common Failure Modes

To design for availability, you must understand how systems fail.  
Failures don’t ask for permission and they rarely happen at convenient times.

## Hardware Failures

Everything physical eventually breaks. The question is **when**, not **if**.

| Component        | Typical Failure Rate | MTBF              |
|------------------|---------------------|-------------------|
| Hard Drive (HDD) | 2–4% per year       | 300,000 hours     |
| SSD              | 0.5–1% per year     | 1–2 million hours |
| Server           | 2–4% per year       | 300,000 hours     |
| Network Switch   | 1–2% per year       | 500,000 hours     |
| Power Supply     | 1–3% per year       | 400,000 hours     |

> **MTBF** = *Mean Time Between Failures*

At scale, hardware failures are not exceptional—they are routine.  
A data center with 10,000 servers will experience **hundreds of failures per year**.

**If your system cannot handle a server failing at any moment, it is not highly available.**

## Software Failures

Hardware fails randomly.  
Software fails **creatively**.

Common failure patterns:

- **Bugs** → Crashes or incorrect behavior  
- **Memory leaks** → Gradual resource exhaustion  
- **Deadlocks** → Processes waiting on each other indefinitely  
- **Cascading failures** → One failure triggers others across systems  

## Network Failures

Network issues are often **subtle, intermittent, and hard to debug**.

Typical problems:

- **Packet loss** → Data never reaches its destination  
- **Latency spikes** → Sudden delays in communication  
- **Network partitions** → Groups of servers become isolated  
- **DNS failures** → Name resolution stops working  

## Human Errors

An uncomfortable truth: **70–80% of outages are caused by human error**.

Not hardware. Not software. People.

Common examples:

- **Configuration mistakes** - Wrong environment variable, typos in config  
- **Failed deployments** - Bad code or broken migrations in production  
- **Accidental deletions** - Running the wrong command in the wrong place  
- **Capacity planning errors** - Underestimating traffic or load  

---

## Key Takeaway

Humans make mistakes—that’s unavoidable.

**Well-designed systems:**
- Make mistakes **hard to introduce**
- Make failures **safe**
- Make recovery **fast and predictable**

This is why **[automation](https://www.ibm.com/think/topics/automation) and [testing](https://www.ibm.com/think/topics/software-testing)** are essential for reliability.

## Redundancy

If there is one concept that underpins all of availability, it is redundancy. The logic is simple: if you have only one of something, when it fails, you have zero. If you have two, when one fails, you still have one.

Redundancy means having backup components that can take over when primary components fail.

### Active-Passive (Standby)

In an active-passive configuration, one component handles all the work while another waits idle as a backup. When the active component fails, the passive one takes over.

TODO IMAGE

Active-passive mode is commonly used in situations where you want a single source of truth and controlled writes like databases, stateful services, and systems requiring a single leader.

Pros

- Simple to reason about
- Standby typically uses fewer resources
- Clear source of truth

Cons

- Failover takkes time (detection + promotion + routing changes)
- Standby may not be truly "production-ready" because it is not tested under real load
- Potential for split-brain problem

### Active-Active

In an active-active configuration, all components handle traffic simultaneously. There is no distinction between primary and backup because every node is doing real work.

TODO IMAGE

When one node fails, the load balancer simply stops sending traffic to it. There is no failover process because the other nodes were already handling traffic. The remaining nodes absorb the additional load.

Pros

- No failover delay
- All nodes tested under real load
- Better resource utilization

Cons

- More complex
- Must handle data consistency across nodes
- Requires stateless design or shared state

The key requiremente for active-active is that requests can be handle by any node.

### Geographic Redundancy

Redundancy within a single data center protects against hardware failures, but what if the entire data center goes offline? Power outages, network cuts, natural disasters, or even a backhoe cutting a fiber line can take down an entire facility.

Geo redundancy distributes your system across multiple physical locations:

TODO IMAGE

**Availability Zones** are the sweet spot for most applications. They provide meaningful isolation (separate power, cooling, and network) while keeping latency low enough for synchronous replication. Most cloud-native applications deploy across at least two AZs.

**Multi-region** deployment is necessary for global applications or those requiring disaster recovery from regional events. The challenge is data replication, since synchronous replication across regions adds significant latency. Most multi-region systems use asynchronous replication and accept some data loss in a disaster (typically seconds to minutes of transactions).

### Redundancy Across Layers

A chain is only as strong as its weakest link. If you have redundant app servers but a single database, the database is your single point of failure. True high availability requires redundancy at every layer of your stack.

TODO IMAGE

Notice that redundancy gets harder as you move down the stack. Adding more web servers is trivial. Adding database replicas with automatic failover requires careful engineering.

> Note: Redundancy is not free. Every backup server, every replica, every additional availability zone costs money. The question is whether that cost is justified by the reduction in downtime risk.
