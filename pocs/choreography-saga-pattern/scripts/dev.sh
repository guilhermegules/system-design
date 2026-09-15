#!/usr/bin/env bash
#
# dev.sh - orchestration facade for the saga orders platform.
#
# Delegates to docker compose, npm and the Gradle wrappers instead of
# re-implementing each tool's build/test logic.
#
# Usage:
#   ./scripts/dev.sh <command> [args]
#
# Commands:
#   up          Build and start the full stack (infra + services)
#   down        Stop and remove containers
#   build       Build all service images
#   test        Run unit tests for all services
#   e2e         Start stack and run the Python E2E suite
#   seed        Seed sample stock in inventory-service
#   logs [-f]   Tail compose logs
#   ps          Show container status
#   status      Alias for ps
#   help        Show this help
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose --project-directory ${ROOT_DIR} -f ${ROOT_DIR}/docker-compose.yml"

ORDERS_DIR="${ROOT_DIR}/services/orders-service"
INVENTORY_DIR="${ROOT_DIR}/services/inventory-service"
PAYMENT_DIR="${ROOT_DIR}/services/payment-service"

log() {
  printf "\033[1;36m[saga]\033[0m %s\n" "$*"
}

cmd_up() {
  log "starting full stack"
  ${COMPOSE} up -d --build
  log "stack started. Kong proxy: http://localhost:8000"
}

cmd_down() {
  log "stopping stack"
  ${COMPOSE} down
}

cmd_build() {
  log "building service images"
  ${COMPOSE} build
}

cmd_test() {
  if [ -f "${ORDERS_DIR}/package.json" ]; then
    log "testing orders-service"
    (cd "${ORDERS_DIR}" && npm test)
  fi

  if [ -x "${INVENTORY_DIR}/gradlew" ]; then
    log "testing inventory-service"
    (cd "${INVENTORY_DIR}" && ./gradlew test)
  fi

  if [ -x "${PAYMENT_DIR}/gradlew" ]; then
    log "testing payment-service"
    (cd "${PAYMENT_DIR}" && ./gradlew test)
  fi

  log "all tests finished"
}

cmd_e2e() {
  log "starting stack"
  ${COMPOSE} up -d --build

  log "running E2E suite"
  python3 -m venv "${ROOT_DIR}/e2e/.venv"
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/e2e/.venv/bin/activate"
  pip install --quiet -r "${ROOT_DIR}/e2e/requirements.txt"
  (cd "${ROOT_DIR}/e2e" && pytest -v)
}

cmd_seed() {
  log "seeding sample stock"
  curl -sS -X POST http://localhost:8081/internal/seed -o /dev/null || {
    echo "failed to seed inventory-service (is it running?)" >&2
    exit 1
  }
  log "stock seeded"
}

cmd_logs() {
  ${COMPOSE} logs "$@"
}

cmd_ps() {
  ${COMPOSE} ps
}

cmd_help() {
  sed -n '2,22p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

case "${1:-help}" in
  up) cmd_up ;;
  down) cmd_down ;;
  build) cmd_build ;;
  test) cmd_test ;;
  e2e) cmd_e2e ;;
  seed) cmd_seed ;;
  logs) shift; cmd_logs "$@" ;;
  ps|status) cmd_ps ;;
  help|-h|--help) cmd_help ;;
  *) echo "unknown command: ${1}" >&2; cmd_help >&2; exit 1 ;;
esac
