# Pipeline Architecture Style: In-Depth Architecture Specification

> References: Mark Richards & Neal Ford, *Fundamentals of Software Architecture* (O'Reilly).

---

## 1. Pipeline Topology & Fundamentals

The **Pipeline Architecture Style** (also known as **Pipes and Filters**) is an architectural pattern that structures execution around unidirectional data processing.

```mermaid
flowchart LR
    P["Producer Filter\n(Data Source)"] -->|Pipe 1| T["Tester Filter\n(Criteria Guard)"]
    T -->|Pipe 2| TR["Transformer Filter\n(Map / Enrich)"]
    TR -->|Pipe 3| MR["MapReduce Transformer\n(Scatter / Gather)"]
    MR -->|Pipe 4| C["Consumer Filter\n(Terminal Sink)"]
```

### 1.1 Pipes
- **Unidirectional & Point-to-Point**: A pipe accepts input from exactly one upstream filter and sends output to exactly one downstream filter.
- **Decoupled Contracts**: Filters know nothing about upstream or downstream stages. They communicate only through the data format delivered by the pipe.
- **Buffering & Backpressure**: Pipes can be unbuffered (direct method call), buffered (FIFO queue), or streaming (reactive stream with backpressure).

### 1.2 Filters
Filters are self-contained, discrete, and stateless processing units.

```mermaid
classDiagram
    class IFilter {
        <<interface>>
        +String name
        +FilterType type
        +execute(input)
    }
    class ProducerFilter {
        +execute() AsyncIterable
    }
    class TesterFilter {
        +test(input) Boolean
        +execute(input) OutputOrNull
    }
    class TransformerFilter {
        +execute(input) TransformedOutput
    }
    class ConsumerFilter {
        +execute(input) void
    }

    IFilter <|-- ProducerFilter
    IFilter <|-- TesterFilter
    IFilter <|-- TransformerFilter
    IFilter <|-- ConsumerFilter
```

---

## 2. Monolithic vs. Distributed Deployment Models

A primary focus in Richards & Ford's analysis is the contrast between **monolithic** and **distributed** pipeline implementations.

```mermaid
flowchart TB
    subgraph Monolithic["Monolithic Pipeline (Single Process)"]
        direction LR
        M_F1["Filter 1\n(Producer)"] ===>|In-Memory Queue| M_F2["Filter 2\n(Tester)"] ===>|In-Memory Channel| M_F3["Filter 3\n(Consumer)"]
    end

    subgraph Distributed["Distributed Pipeline (Multi-Service / Event-Driven)"]
        direction LR
        D_F1["Service 1\nProducer"] -->|Kafka Topic / AMQP| D_F2["Service 2\nTester"] -->|RabbitMQ / SQS| D_F3["Service 3\nConsumer"]
    end
```

### Comparison Matrix

| Dimension | Monolithic Pipeline | Distributed Pipeline |
| :--- | :--- | :--- |
| **Typical Deployment** | Single OS process, container, or JVM | Microservices, AWS Lambda, Kubernetes pods |
| **Pipes Mechanism** | Async queues, reactive streams, channels | Kafka topics, RabbitMQ queues, gRPC streams |
| **Latency** | Sub-millisecond (in-memory pointer exchange) | Network latency per hop (5-50ms+) |
| **Data Serialization** | Zero serialization (passes live objects) | JSON, Protobuf, Avro overhead |
| **Elasticity** | Scales entire process as one unit | Filters scale independently based on load |
| **Reliability** | Process crash aborts pipeline | Durable queues allow retries and dead-lettering |
| **Failure Handling** | In-process try/catch or supervisor | Dead-Letter Queues (DLQ), Sagas, Idempotency |

---

## 3. MapReduce as a Composite Filter

Within a pipeline, high-volume analytics stages often employ the **MapReduce Pattern** (Scatter-Gather):

```mermaid
flowchart TD
    In["Batch of Normalized Transactions"] --> Scatter["Scatter / Partition Step"]
    Scatter --> W1["Worker 1: Map Currency USD"]
    Scatter --> W2["Worker 2: Map Currency EUR"]
    Scatter --> W3["Worker 3: Map Currency GBP"]
    W1 --> Shuffle["Shuffle & Group by Key"]
    W2 --> Shuffle
    W3 --> Shuffle
    Shuffle --> Reducer["Reduce: Sum Volume & Average Risk Score"]
    Reducer --> Out["Aggregated Risk Summary"]
```

In our architecture, the **MapReduce filter is a Transformer** that accepts an array/stream of individual records, groups them across partitions, computes windowed metrics, and outputs structured analytical aggregates to downstream consumer filters.
