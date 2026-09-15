# E2E Tests

Black-box suite for the choreographed saga platform. Tests drive the public
API through Kong and assert the resulting side effects directly in the
services' databases.

## Coverage

- `test_happy_path.py` — a normal order flows through the saga and reaches
  `COMPLETED`, with a `PROCESSED` payment row recorded.
- `test_compensation.py` — `inventory_failure` cancels the order; a
  `payment_failure` cancels the order, releases the reservation and restores
  the stock quantity to its baseline.

## How it works

`conftest.py` waits until all three services are healthy (orders via Kong,
inventory/payment via actuator), seeds stock through
`POST /internal/seed`, and exposes fixtures to create orders, poll order
status and query the Postgres databases directly.

## Running

The stack must be up first, then:

```bash
./scripts/dev.sh e2e
```

or manually:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -v
```
