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
