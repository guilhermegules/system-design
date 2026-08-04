#!/usr/bin/env bash
set -euo pipefail

BOOTSTRAP="${BOOTSTRAP_SERVER:-kafka:9092}"

TOPICS=(
  "order.created"
  "inventory.reserved"
  "inventory.reservation-failed"
  "payment.processed"
  "payments.unauthorized"
  "order.cancelled"
  "order.completed"
)

for topic in "${TOPICS[@]}"; do
  echo "creating topic: ${topic}"
  /opt/kafka/bin/kafka-topics.sh \
    --bootstrap-server "${BOOTSTRAP}" \
    --create \
    --if-not-exists \
    --topic "${topic}" \
    --partitions 3 \
    --replication-factor 1
done

echo "all topics created"
