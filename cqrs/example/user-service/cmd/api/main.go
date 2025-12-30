package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/joho/godotenv"
	"github.com/rabbitmq/amqp091-go"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	httpAdapter "userservice/internal/adapters/inbound/http"
	mongoAdapter "userservice/internal/adapters/outbound/mongo"
	pgAdapter "userservice/internal/adapters/outbound/postgres"
	rabbitAdapter "userservice/internal/adapters/outbound/rabbitmq"
	"userservice/internal/application/command"
	"userservice/internal/application/config"
	"userservice/internal/application/consumer"
	"userservice/internal/application/query"
)

func main() {
	// -------------------------------------------------
	// Load ENV
	// -------------------------------------------------
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ No .env file found, using system envs")
	}

	config := config.Load()

	// -------------------------------------------------
	// PostgreSQL (Write Side)
	// -------------------------------------------------
	pgDB, err := gorm.Open(postgres.Open(config.PostgresDSN()), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Failed to connect to Postgres:", err)
	}

	log.Println("✅ Connected to PostgreSQL")

	// Auto-migrate (infra concern)
	_ = pgDB.AutoMigrate(&pgAdapter.UserModel{})

	// -------------------------------------------------
	// MongoDB (Read Side)
	// -------------------------------------------------
	mongoCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoClient, err := mongo.Connect(
		mongoCtx,
		options.Client().ApplyURI(config.MongoURI()),
	)
	if err != nil {
		log.Fatal("❌ Failed to connect to MongoDB:", err)
	}

	mongoDB := mongoClient.Database(config.Mongo.DB)
	log.Println("✅ Connected to MongoDB")

	// -------------------------------------------------
	// RabbitMQ
	// -------------------------------------------------
	amqpConn, err := amqp091.Dial(config.RabbitMQURI())
	if err != nil {
		log.Fatal("❌ Failed to connect to RabbitMQ:", err)
	}

	amqpChannel, err := amqpConn.Channel()
	if err != nil {
		log.Fatal("❌ Failed to open RabbitMQ channel:", err)
	}

	log.Println("✅ Connected to RabbitMQ")

	// -------------------------------------------------
	// Adapters (Outbound)
	// -------------------------------------------------
	userWriteRepo := pgAdapter.NewUserRepository(pgDB)
	userReadRepo := mongoAdapter.NewUserReadRepository(mongoDB)
	eventPublisher := rabbitAdapter.NewPublisher(amqpChannel)

	// -------------------------------------------------
	// Use Cases
	// -------------------------------------------------
	createUserUseCase := command.NewCreateUserService(
		userWriteRepo,
		eventPublisher,
	)
	getUserUseCase := query.NewGetUserService(userReadRepo)

	// -------------------------------------------------
	// HTTP Handlers (Inbound Adapters)
	// -------------------------------------------------
	createUserHandler := httpAdapter.NewCreateUserHandler(createUserUseCase)
	getUseCaseHandler := httpAdapter.NewGetUserHandler(getUserUseCase)

	mux := http.NewServeMux()
	mux.Handle("/users", createUserHandler)
	mux.Handle("/users/", getUseCaseHandler)

	// -------------------------------------------------
	// HTTP Server
	// -------------------------------------------------
	log.Printf(
		"🚀 %s running on :%s (%s)",
		config.App.Name,
		config.App.Port,
		config.App.Env,
	)

	userCreatedConsumer := consumer.NewUserCreatedConsumer(
		amqpChannel,
		userReadRepo,
	)

	ctx, cancel := context.WithCancel(context.Background())

	defer cancel()

	if err := userCreatedConsumer.Start(ctx); err != nil {
		log.Fatal("❌ Failed to start consumer:", err)
	}

	log.Fatal(
		http.ListenAndServe(":"+config.App.Port, mux),
	)
}
