# Pipeline Architecture Style - Elixir Example

This subproject demonstrates the **Pipeline Architecture Style** in Elixir using:
- The native `|>` pipe operator to compose discrete filters cleanly.
- Functional purity and immutable pattern matching.
- An in-pipeline MapReduce stage (`group_by` -> `map` -> `reduce`).

## Topology

```
produce_raw() |> test_compliance() |> transform_currency_and_tax() |> map_reduce_analytics() |> consume_report()
```

1. **Producer Filter (`produce_raw/0`)**: Streams raw transaction maps.
2. **Tester Filter (`test_compliance/1`)**: Discards invalid (non-positive) amounts.
3. **Transformer Filter (`transform_currency_and_tax/1`)**: Converts currency rates and calculates tax.
4. **MapReduce Transformer Filter (`map_reduce_analytics/1`)**: Partitions by currency and computes volume aggregates.
5. **Consumer Filter (`consume_report/1`)**: Terminal sink printing the executive audit report.

## Run

Prerequisites: Elixir 1.14+.

```bash
elixir -r lib/pipeline_demo.ex -e "PipelineDemo.run()"
```
