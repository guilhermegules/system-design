infra-up:
	docker compose --profile infra up -d

infra-down:
	docker compose down

run:
	go run ./cmd/api

full:
	docker compose --profile infra --profile app up --build
