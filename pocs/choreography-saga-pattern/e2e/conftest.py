import time
import uuid

import psycopg
import pytest
import requests

KONG_URL = "http://localhost:8000"
ORDERS_URL = f"{KONG_URL}/orders"
INVENTORY_HEALTH_URL = "http://localhost:8081/actuator/health"
PAYMENT_HEALTH_URL = "http://localhost:8082/actuator/health"
SEED_URL = "http://localhost:8081/internal/seed"

PG_HOST = "localhost"
PG_PORT = 5432
PG_USER = "postgres"
PG_PASSWORD = "postgres"

READY_TIMEOUT = 180
SAGA_TIMEOUT = 60


def _http_ok(url: str, timeout: int = 3) -> bool:
    try:
        return requests.get(url, timeout=timeout).status_code == 200
    except requests.RequestException:
        return False


def _connect(dbname: str) -> psycopg.Connection:
    return psycopg.connect(
        host=PG_HOST,
        port=PG_PORT,
        user=PG_USER,
        password=PG_PASSWORD,
        dbname=dbname,
        autocommit=True,
    )


@pytest.fixture(scope="session", autouse=True)
def stack_ready():
    deadline = time.monotonic() + READY_TIMEOUT
    while time.monotonic() < deadline:
        if (
            _http_ok(ORDERS_URL)
            and _http_ok(INVENTORY_HEALTH_URL)
            and _http_ok(PAYMENT_HEALTH_URL)
        ):
            break
        time.sleep(3)
    else:
        raise RuntimeError("stack did not become ready in time")

    requests.post(SEED_URL, timeout=5)
    yield


@pytest.fixture(scope="session")
def db_inventory():
    conn = _connect("inventory")
    yield conn
    conn.close()


@pytest.fixture(scope="session")
def db_payment():
    conn = _connect("payment")
    yield conn
    conn.close()


def _read_stock_quantity(db, product_id: str) -> int | None:
    with db.cursor() as cur:
        cur.execute(
            "SELECT quantity FROM stock_items WHERE product_id = %s",
            (product_id,),
        )
        row = cur.fetchone()
    return int(row[0]) if row else None


@pytest.fixture()
def stock_quantity(db_inventory):
    def _quantity(product_id: str) -> int | None:
        return _read_stock_quantity(db_inventory, product_id)

    return _quantity


@pytest.fixture()
def create_order():
    def _create(items=None, simulate=None):
        payload = {
            "customerId": str(uuid.uuid4()),
            "items": items
            or [{"productId": "sku-1", "quantity": 2, "unitPrice": 49.9}],
        }
        if simulate:
            payload["simulate"] = simulate
        resp = requests.post(ORDERS_URL, json=payload, timeout=10)
        resp.raise_for_status()
        return resp.json()

    return _create


@pytest.fixture()
def get_order():
    def _get(order_id: str):
        resp = requests.get(f"{ORDERS_URL}/{order_id}", timeout=10)
        resp.raise_for_status()
        return resp.json()

    return _get


@pytest.fixture()
def wait_for_status():
    def _wait(order_id: str, status: str, timeout: int = SAGA_TIMEOUT) -> dict:
        deadline = time.monotonic() + timeout
        last = None
        while time.monotonic() < deadline:
            try:
                order = requests.get(
                    f"{ORDERS_URL}/{order_id}", timeout=10
                ).json()
                if order["status"] == status:
                    return order
                last = order
            except requests.RequestException as exc:
                last = exc
            time.sleep(1)
        raise AssertionError(
            f"order {order_id} did not reach {status} within {timeout}s "
            f"(last observation: {last!r})"
        )

    return _wait


@pytest.fixture()
def wait_until():
    def _wait(predicate, timeout: int = SAGA_TIMEOUT, label: str = "condition"):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if predicate():
                return
            time.sleep(1)
        raise AssertionError(f"{label} not satisfied within {timeout}s")

    return _wait
