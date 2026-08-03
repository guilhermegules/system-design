"""Compensation: failed legs of the saga must cancel the order and undo
already-applied side effects."""


def test_inventory_failure_cancels_order(create_order, wait_for_status):
    order = create_order(
        simulate="inventory_failure",
        items=[{"productId": "sku-1", "quantity": 1, "unitPrice": 49.9}],
    )
    order_id = order["id"]

    assert order["status"] == "PENDING"
    cancelled = wait_for_status(order_id, "CANCELLED")
    assert cancelled["status"] == "CANCELLED"


def test_payment_failure_cancels_order_and_releases_stock(
    create_order, wait_for_status, db_inventory, stock_quantity, wait_until
):
    product_id = "sku-1"
    before = stock_quantity(db_inventory, product_id)
    assert before is not None

    order = create_order(
        simulate="payment_failure",
        items=[{"productId": product_id, "quantity": 2, "unitPrice": 49.9}],
    )
    order_id = order["id"]

    assert order["status"] == "PENDING"
    cancelled = wait_for_status(order_id, "CANCELLED")
    assert cancelled["status"] == "CANCELLED"

    with db_inventory.cursor() as cur:
        cur.execute(
            "SELECT status FROM reservations WHERE order_id = %s", (order_id,)
        )
        rows = cur.fetchall()
    assert rows, "no reservation recorded for cancelled order"
    assert all(row[0] == "RELEASED" for row in rows), rows

    wait_until(
        lambda: stock_quantity(db_inventory, product_id) == before,
        label="stock released back to baseline",
    )
