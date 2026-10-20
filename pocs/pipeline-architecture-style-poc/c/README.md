# Pipeline Architecture Style - C Unix POSIX Example

This subproject demonstrates the foundational **Unix Pipeline Architecture** using operating-system primitives:
- `pipe()`: Creates kernel-level unidirectional byte streams.
- `fork()`: Creates child processes for each discrete filter.
- `dup2()`: Redirects standard file descriptors (`stdin` and `stdout`) to connect filters through pipes.

## Topology

```
[Producer Process] ===(POSIX Pipe 1)===> [Tester Process] ===(POSIX Pipe 2)===> [Transformer/Consumer Process]
```

1. **Producer**: Emits raw transaction values (both valid positive and invalid negative numbers) into Pipe 1.
2. **Tester**: Reads from Pipe 1, evaluates positive criteria, filters out negative/invalid values, and forwards to Pipe 2.
3. **Transformer & Consumer**: Reads from Pipe 2, computes a 15% withholding tax, and prints formatted summary records.

## Build and Run

```bash
make
./unix_pipeline
```
