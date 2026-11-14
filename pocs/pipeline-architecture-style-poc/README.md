# Pipeline Architecture Style (Pipes and Filters) - Multi-Language POC

**Author**: Guilherme Gules Moreira  
**Theoretical Reference**: Mark Richards & Neal Ford, *Fundamentals of Software Architecture: An Engineering Approach* (O'Reilly)

---

## 🏛️ Executive Summary & Architectural Overview

The **Pipeline Architecture Style** (traditionally referred to as **Pipes and Filters**) is a structural pattern designed for linear data processing pipelines. A complex processing task is decomposed into a set of discrete, self-contained processing steps called **Filters**, connected by unidirectional communication channels called **Pipes**.

```
+---------------+           +---------------+           +-------------------+           +---------------+
|   Producer    |  (Pipe 1) |    Tester     |  (Pipe 2) |    Transformer    |  (Pipe 3) |   Consumer    |
|    Filter     | =========>|    Filter     | =========>|   (MapReduce)     | =========>|    Filter     |
| (Source / In) |           | (Rule Check)  |           | (Enrich / Calc)   |           | (Sink / Out)  |
+---------------+           +---------------+           +-------------------+           +---------------+
```

### Key Principles from Richards & Ford
1. **Unidirectional, Point-to-Point Pipes**: Pipes accept input from exactly one filter and send output to exactly one downstream filter. They isolate filters from one another.
2. **Stateless, Self-Contained Filters**: Filters should perform a single bounded transformation without coupling to the internal state of upstream or downstream stages.
3. **Composability**: Filters can be reordered, replaced, or scaled independently without modifying other pipeline stages.

---

## 🧩 The Four Canonical Filter Types

In *Fundamentals of Software Architecture*, filters are classified into four discrete functional types:

```
1. PRODUCER:    [ Source DB / Feed ] ---> [ Filter ] ===(Pipe)===>
2. TRANSFORMER: ===(Pipe)===> [ Filter: Map / Calculate ] ===(Pipe)===>
3. TESTER:      ===(Pipe)===> [ Filter: Criteria ? ] ===(Pipe)===> (if pass)
                                         |
                                         v (if fail: discard / dead-letter)
4. CONSUMER:    ===(Pipe)===> [ Filter: Terminal Sink ] ---> [ Storage / UI ]
```

| Filter Type | Directionality | Responsibility | Enterprise Example |
| :--- | :--- | :--- | :--- |
| **Producer** | **Outbound only** | Acts as the data source; reads from external APIs, queues, or databases and emits payloads into the initial pipe. | Ingests transaction records from the **Raw Transactions DB**. |
| **Tester** | **Inbound & Outbound (Conditional)** | Evaluates payloads against criteria (fraud thresholds, allowed currencies, schema validation). Emits passed records or drops/diverts invalid ones. | Verifies business rules against the **Selection Rules DB**. |
| **Transformer** | **Inbound & Outbound** | Ingests a payload, performs transformations (currency conversion, withholding tax calculation, MapReduce aggregation), and emits transformed items. | Normalizes currencies and runs **MapReduce** to the **Analytics DB**. |
| **Consumer** | **Inbound only** | Terminal sink of the pipeline; writes results to datastores, generates reports, or triggers notifications. | Saves the final audit summary to the **Executive Report DB**. |

---

## 📜 Historical Precedent: *"More Shell, Less Egg"* (1986)

In 1986, Donald Knuth was asked by Jon Bentley (*Communications of the ACM*) to demonstrate **Literate Programming** by solving a text problem:
> *"Given a text file and an integer $k$, print the $k$ most common words in the file and their frequencies in descending order."*

- **Donald Knuth's Solution**: A 10-page Pascal program featuring a custom Patricia trie data structure and custom memory management routines.
- **Doug McIlroy's Response** (*Inventor of Unix Pipes*): A critique titled *"A literate program: More shell, less egg"*, solving the exact problem using a **6-command Unix shell pipeline**:

```bash
tr -cs A-Za-z '\n' | tr A-Z a-z | sort | uniq -c | sort -rn | sed 10q
```

### Filter Breakdown of McIlroy's Pipeline
1. `tr -cs A-Za-z '\n'` *(Transformer)*: Breaks words into individual lines.
2. `tr A-Z a-z` *(Transformer)*: Normalizes characters to lowercase.
3. `sort` *(Transformer)*: Sorts tokens lexicographically.
4. `uniq -c` *(Transformer / Reducer)*: Collapses contiguous duplicates and outputs counts.
5. `sort -rn` *(Transformer)*: Sorts counts numerically descending.
6. `sed 10q` *(Tester / Consumer)*: Emits the top 10 lines and closes the stream.

*Read the complete historical analysis in [`docs/MORE_SHELL_LESS_EGG.md`](docs/MORE_SHELL_LESS_EGG.md).*

---

## 🌐 Monolithic vs. Distributed Pipeline Architectures

A key insight in *Fundamentals of Software Architecture* is that **most pipeline implementations are monolithic**, but each filter can also be deployed as an independent service:

```
MONOLITHIC PIPELINE (In-Memory)
[Producer Filter] ===(Async Queue / Buffer)===> [Tester Filter] ===(Channel)===> [Consumer Filter]
  • Sub-millisecond latency (zero network hops)
  • Simple single-unit deployment
  • Lacks independent scalability for bottleneck filters

DISTRIBUTED PIPELINE (Microservices / Messaging)
[Service 1: Producer] ---> (Kafka Topic) ---> [Service 2: Tester] ---> (RabbitMQ) ---> [Service 3: Consumer]
  • Independent elasticity & autoscaling per filter
  • Polyglot filter implementations
  • Network latency, serialization overhead, and partial failure complexity
```

---

## 📊 End-to-End Multi-Database Flow

The implementations in this repository model an enterprise financial data pipeline interacting with **four separate databases**:

```
+--------------------------+
|  Raw Transaction DB      | (Ingestion Source)
+------------+-------------+
             |
             v
   [ 1. PRODUCER FILTER ]  ===> ( Pipe: Raw Records )
                                       |
                                       v
                             +---------+-------------------+
                             |  Selection Rules DB         | (Configuration & Fraud Rules)
                             +---------+-------------------+
                                       |
                                       v
                             [ 2. TESTER FILTER ]          ===> ( Pipe: Validated Records )
                                                                       |
                                                                       v
                                                             [ 3. TRANSFORMER FILTER ] ===> ( Pipe: Normalized Records )
                                                               (Currency & Tax Calc)                 |
                                                                                                     v
                                                                                           +---------+-------------------+
                                                                                           |  Analytics DB               | (TimeSeries Store)
                                                                                           +---------+-------------------+
                                                                                                     |
                                                                                                     v
                                                                                           [ 4. MAPREDUCE FILTER ]  ===> ( Pipe: Risk Aggregates )
                                                                                             (Scatter-Map-Shuffle-Reduce)         |
                                                                                                                                  v
                                                                                                                        +---------+--------------------+
                                                                                                                        |  Executive Report DB         | (Warehouse Sink)
                                                                                                                        +---------+--------------------+
                                                                                                                                  |
                                                                                                                                  v
                                                                                                                        [ 5. CONSUMER FILTER ]
```

---

## ⚠️ Architectural Risks & Trade-Offs (Richards & Ford)

| Quality Attribute | Monolithic Rating | Distributed Rating | Trade-Off & Risk Summary |
| :--- | :---: | :---: | :--- |
| **Simplicity** | ⭐⭐⭐⭐⭐ | ⭐⭐ | Monolithic pipes are in-process memory structures. Distributed systems require broker management, serialization, and network retries. |
| **Cost** | ⭐⭐⭐⭐⭐ | ⭐⭐ | Monoliths require minimal cloud resources; distributed setups need message broker clusters and multiple container instances. |
| **Deployability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Monolith deploys as a single binary; distributed allows independent filter deployments but requires backward-compatible data schemas. |
| **Testability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Pure filter functions are simple to unit test; distributed pipes require mocking brokers and managing asynchronous state timing. |
| **Performance** | ⭐⭐⭐ | ⭐⭐ | In-memory pipes have near-zero latency; distributed pipes incur 10-50ms network and serialization overhead per hop. |
| **Elasticity** | ⭐ | ⭐⭐⭐⭐ | Monoliths cannot scale only the bottleneck filter. Distributed systems enable autoscaling individual filters (e.g., 50 MapReduce workers). |
| **Reliability** | ⭐⭐ | ⭐⭐⭐ | In-memory crash kills the pipeline. Distributed brokers provide durable queues, but require Dead-Letter Queues (DLQ) and idempotency. |

*Read the in-depth risk mitigations in [`docs/RISKS_AND_TRADEOFFS.md`](docs/RISKS_AND_TRADEOFFS.md).*

---

## 💻 Multi-Language Implementation Projects

This repository provides working code across four distinct language paradigms:

### 1. TypeScript (`typescript/`)
- Complete enterprise implementation with async pipes (`AsyncQueuePipe`), backpressure, and simulated distributed message pipes (`DistributedMessagePipe`).
- Contains a generic **`MapReduceEngine`** performing parallel scatter, map, shuffle, and reduce.
- Connects 4 simulated databases and includes both **monolithic** and **distributed** runners.
- **Run**:
  ```bash
  cd typescript
  node --experimental-strip-types src/index.ts
  node --experimental-strip-types --test tests/pipeline.test.ts
  ```

### 2. Java (`java/`)
- Enterprise declarative implementation using custom annotations: `@Filter(type = FilterType.TESTER)`.
- Uses reflection to discover pipeline stages and orchestrates streams through the 4 filter types.
- **Run**:
  ```bash
  cd java
  mvn clean compile exec:java -Dexec.mainClass="com.architecture.pipeline.App"
  ```

### 3. C Unix / POSIX (`c/`)
- Fundamental Unix implementation using kernel pipes: `pipe()`, `fork()`, and `dup2()`.
- Demonstrates true process-isolated filters communicating via standard stream redirection.
- **Run**:
  ```bash
  cd c
  make
  ./unix_pipeline
  ```

### 4. Elixir (`elixir/`)
- Idiomatic functional implementation leveraging Elixir's native `|>` pipe operator.
- Features pattern matching, immutable data pipelines, and concurrent MapReduce aggregation.
- **Run**:
  ```bash
  cd elixir
  elixir -r lib/pipeline_demo.ex -e "PipelineDemo.run()"
  ```
