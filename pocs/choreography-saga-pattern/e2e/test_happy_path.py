"""Happy-path saga: an order created through Kong must reach COMPLETED."""


def test_order_completes_end_to_end(create_order, wait_for_status, db_payment):
    order = create_order(
        items=[{"productId": "sku-1", "quantity": 2, "unitPrice": 49.9}]
    )
    order_id = order["id"]

    assert order["status"] == "PENDING"

    completed = wait_for_status(order_id, "COMPLETED")
    assert completed["status"] == "COMPLETED"
    assert completed["currency"] == "USD"

    with db_payment.cursor() as cur:
        cur.execute(
            "SELECT status FROM payments WHERE order_id = %s", (order_id,)
        )
        rows = cur.fetchall()
    assert rows, "no payment row recorded for completed order"
    assert rows[0][0] == "PROCESSED"
