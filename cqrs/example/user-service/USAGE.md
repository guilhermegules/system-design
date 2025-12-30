# Usage Examples & Troubleshooting Guide

## Quick Start

### 1. Start Infrastructure

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker-compose ps
```

Expected output:

```
NAME        STATUS
rabbitmq    healthy
postgres    healthy
mongodb     healthy
```

### 2. Start Services

Terminal 1 - Command Service:

```bash
go run cmd/command-service/main.go
```

Expected output:

```
2025/12/30 10:15:30 Initializing PostgreSQL...
2025/12/30 10:15:30 Initializing RabbitMQ...
2025/12/30 10:15:30 Command Service started on :8080
```

Terminal 2 - Query Service:

```bash
go run cmd/query-service/main.go
```

Expected output:

```
2025/12/30 10:15:31 Initializing MongoDB...
2025/12/30 10:15:31 Initializing RabbitMQ...
2025/12/30 10:15:31 Event consumer started
2025/12/30 10:15:31 Query Service started on :8081
```

## API Usage Examples

### Create User

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

Response:

```json
{
  "message": "User created successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

Save the `user_id` for next steps.

### Wait for Sync

⚠️ **Important**: Wait 1-2 seconds for the event to be processed and synced to MongoDB.

```bash
sleep 2
```

### Get User by ID

```bash
curl http://localhost:8081/users/550e8400-e29b-41d4-a716-446655440000
```

Response:

```json
{
  "_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-12-30T10:15:30Z",
  "updated_at": "2025-12-30T10:15:30Z"
}
```

### Get All Users

```bash
# Get first 10 users
curl "http://localhost:8081/users?limit=10&offset=0"

# Get users with different limit
curl "http://localhost:8081/users?limit=5&offset=0"

# Get with offset
curl "http://localhost:8081/users?limit=10&offset=10"
```

Response:

```json
[
  {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-12-30T10:15:30Z",
    "updated_at": "2025-12-30T10:15:30Z"
  }
]
```

### Search User by Email

```bash
curl "http://localhost:8081/users/search/email?email=john@example.com"
```

Response:

```json
{
  "_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-12-30T10:15:30Z",
  "updated_at": "2025-12-30T10:15:30Z"
}
```

### Update User

```bash
curl -X PUT http://localhost:8080/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com"
  }'
```

Response:

```json
{
  "message": "User updated successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

Wait for sync:

```bash
sleep 2
curl http://localhost:8081/users/550e8400-e29b-41d4-a716-446655440000
```

### Delete User

```bash
curl -X DELETE http://localhost:8080/users/550e8400-e29b-41d4-a716-446655440000
```

Response:

```json
{
  "message": "User deleted successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

Wait for sync:

```bash
sleep 2
curl http://localhost:8081/users/550e8400-e29b-41d4-a716-446655440000
```

Expected: 404 Not Found

## Using Makefile Commands

```bash
# Start everything
make run

# Start only command service
make run-command

# Start only query service
make run-query

# Test endpoints
make test-create-user
make test-get-all-users
make test-search-user

# View logs
make docker-logs
make docker-logs-postgres
make docker-logs-mongodb
make docker-logs-rabbitmq
```

## Database Access

### PostgreSQL

```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U user -d write_db

# List tables
\dt

# View users table
SELECT * FROM users;

# View table structure
\d users
```

### MongoDB

```bash
# Connect to MongoDB
docker exec -it mongodb mongosh

# Use read database
use read_db

# List collections
show collections

# View users collection
db.users.find()

# View specific user
db.users.findOne({_id: "550e8400-e29b-41d4-a716-446655440000"})

# Count users
db.users.countDocuments()
```

### RabbitMQ Management UI

Access: http://localhost:15672

Credentials:

- Username: guest
- Password: guest

Features:

- View queues
- Check queue depth
- View messages
- Monitor connections

## Troubleshooting

### Issue: "Connection refused" for PostgreSQL

**Symptoms:**

```
failed to connect to PostgreSQL: failed to connect to `host=postgres port=5432`
```

**Solutions:**

1. Ensure Docker container is running:

   ```bash
   docker-compose ps | grep postgres
   ```

2. Check container logs:

   ```bash
   docker-compose logs postgres
   ```

3. Verify PostgreSQL is healthy:

   ```bash
   docker-compose exec postgres pg_isready -U user -d write_db
   ```

4. Rebuild and restart:
   ```bash
   docker-compose down
   docker-compose up -d postgres
   sleep 10
   ```

### Issue: "Connection refused" for MongoDB

**Symptoms:**

```
failed to connect to MongoDB: connection refused
```

**Solutions:**

1. Ensure MongoDB container is running:

   ```bash
   docker-compose ps | grep mongodb
   ```

2. Check container logs:

   ```bash
   docker-compose logs mongodb
   ```

3. Verify MongoDB is healthy:

   ```bash
   docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"
   ```

4. Rebuild and restart:
   ```bash
   docker-compose down
   docker-compose up -d mongodb
   sleep 10
   ```

### Issue: "Connection refused" for RabbitMQ

**Symptoms:**

```
failed to connect to RabbitMQ: connection refused
```

**Solutions:**

1. Ensure RabbitMQ container is running:

   ```bash
   docker-compose ps | grep rabbitmq
   ```

2. Check container logs:

   ```bash
   docker-compose logs rabbitmq
   ```

3. Verify RabbitMQ is healthy:

   ```bash
   docker-compose exec rabbitmq rabbitmq-diagnostics -q ping
   ```

4. Rebuild and restart:
   ```bash
   docker-compose down
   docker-compose up -d rabbitmq
   sleep 10
   ```

### Issue: Events not syncing to MongoDB

**Symptoms:**

- Create user succeeds (200 response)
- User not found in query service
- No errors in logs

**Solutions:**

1. Check if event was published:

   - Go to RabbitMQ UI: http://localhost:15672
   - Click "Queues"
   - Check if `user_events` queue has messages
   - If yes, the consumer might not be running

2. Verify query service is running:

   ```bash
   curl http://localhost:8081/users
   ```

   - Should return empty array or users
   - If connection refused, query service isn't running

3. Check event consumer logs:

   ```bash
   # Look for "Event consumer started" message
   ```

4. Manually consume events:
   ```bash
   docker-compose exec rabbitmq rabbitmqctl list_queues
   ```

### Issue: Duplicate user email error

**Symptoms:**

```
Failed to create user: failed to save user
```

**Solutions:**

1. Verify email is unique:

   ```sql
   -- PostgreSQL
   SELECT * FROM users WHERE email = 'existing@example.com';
   ```

2. Use a different email or delete the existing user

### Issue: "User not found" when updating

**Symptoms:**

```
Failed to update user
```

**Solutions:**

1. Verify user ID is correct
2. Check user exists in PostgreSQL:

   ```sql
   SELECT * FROM users WHERE id = 'user-id';
   ```

3. Try creating a new user first

### Issue: Performance is slow

**Solutions:**

1. Check system resources:

   ```bash
   docker stats
   ```

2. Check PostgreSQL connections:

   ```bash
   docker exec postgres psql -U user -d write_db -c "SELECT count(*) FROM pg_stat_activity;"
   ```

3. Monitor RabbitMQ:

   ```bash
   docker exec rabbitmq rabbitmqctl status
   ```

4. Add indexes to MongoDB:
   ```bash
   docker exec mongodb mongosh << EOF
   use read_db
   db.users.createIndex({"email": 1})
   db.users.createIndex({"_id": 1})
   EOF
   ```

### Issue: Out of memory

**Solutions:**

1. Increase Docker memory limit:

   ```bash
   docker-compose down
   # Edit docker-compose.yaml and add memory limits
   docker-compose up -d
   ```

2. Clean up unused data:
   ```bash
   docker system prune
   docker volume prune
   ```

## Performance Testing

### Create 100 users

```bash
#!/bin/bash
for i in {1..100}; do
  curl -X POST http://localhost:8080/users \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"User $i\",
      \"email\": \"user$i@example.com\"
    }"
  echo ""
done
```

### Load test with Apache Bench

```bash
# Install ab if needed
apt-get install apache2-utils

# Test command service
ab -n 1000 -c 10 -H "Content-Type: application/json" \
  -p /dev/stdin http://localhost:8080/users << EOF
{"name":"Test","email":"test@example.com"}
EOF

# Test query service
ab -n 1000 -c 10 http://localhost:8081/users
```

## Cleanup

### Stop services

```bash
# Stop containers but keep volumes
docker-compose down

# Stop and remove everything
docker-compose down -v
```

### Clean up Go artifacts

```bash
make clean
```

### Full reset

```bash
make docker-down
make clean
rm -rf bin/
```

## Environment Variables

Create `.env` file for local testing:

```bash
cp .env.example .env

# Edit .env with your values
POSTGRES_DSN=user=user password=password dbname=write_db host=localhost port=5432 sslmode=disable
MONGODB_URI=mongodb://localhost:27017
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

## Common Commands

```bash
# Build binaries
go build -o bin/command-service cmd/command-service/main.go
go build -o bin/query-service cmd/query-service/main.go

# Format code
go fmt ./...

# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Vendor dependencies
go mod vendor

# Update dependencies
go get -u ./...
```

## Next Steps

1. Add authentication (JWT/OAuth2)
2. Implement comprehensive error handling
3. Add distributed tracing (OpenTelemetry)
4. Add caching layer (Redis)
5. Implement more complex projections
6. Add event versioning support
7. Implement saga pattern for complex transactions
8. Add metrics collection (Prometheus)
9. Implement health checks and metrics endpoints
10. Add configuration management
