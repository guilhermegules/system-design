# Pipeline Architecture Style - Java Annotation Example

This subproject demonstrates the **Pipeline Architecture Style** in Java using **custom annotations** (`@Filter`) and the four canonical filter types from *Fundamentals of Software Architecture*:
1. **Producer**: Source generator (`produceTransactions`)
2. **Tester**: Business validation guard (`validateTransaction`)
3. **Transformer**: Currency conversion & tax enricher (`transformTransaction`)
4. **Consumer**: Terminal audit reporter (`consumeReport`)

## Build & Run

Prerequisites: JDK 17+ and Apache Maven.

```bash
# Compile and run
mvn clean compile exec:java -Dexec.mainClass="com.architecture.pipeline.App"
```
