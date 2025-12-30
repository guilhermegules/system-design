package config

import (
	"fmt"
	"os"
)

type Config struct {
	App struct {
		Name string
		Env  string
		Port string
	}

	Postgres struct {
		Host     string
		Port     string
		DB       string
		User     string
		Password string
		SSLMode  string
	}

	Mongo struct {
		Host string
		Port string
		DB   string
	}

	RabbitMQ struct {
		Host     string
		Port     string
		User     string
		Password string
	}
}

func Load() *Config {
	config := &Config{}

	config.App.Name = getEnv("APP_NAME", "user-service")
	config.App.Env = getEnv("APP_ENV", "dev")
	config.App.Port = getEnv("APP_PORT", "8080")

	config.Postgres.Host = getEnv("POSTGRES_HOST", "localhost")
	config.Postgres.Port = getEnv("POSTGRES_PORT", "5432")
	config.Postgres.DB = getEnv("POSTGRES_DB", "write_db")
	config.Postgres.User = getEnv("POSTGRES_USER", "user")
	config.Postgres.Password = getEnv("POSTGRES_PASSWORD", "password")
	config.Postgres.SSLMode = getEnv("POSTGRES_SSLMODE", "disable")

	config.Mongo.Host = getEnv("MONGO_HOST", "localhost")
	config.Mongo.Port = getEnv("MONGO_PORT", "27017")
	config.Mongo.DB = getEnv("MONGO_DB", "read_db")

	config.RabbitMQ.Host = getEnv("RABBITMQ_HOST", "localhost")
	config.RabbitMQ.Port = getEnv("RABBITMQ_PORT", "5672")
	config.RabbitMQ.User = getEnv("RABBITMQ_USER", "guest")
	config.RabbitMQ.Password = getEnv("RABBITMQ_PASSWORD", "guest")

	return config
}

func (c *Config) PostgresDSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Postgres.Host,
		c.Postgres.Port,
		c.Postgres.User,
		c.Postgres.Password,
		c.Postgres.DB,
		c.Postgres.SSLMode,
	)
}

func (c *Config) MongoURI() string {
	return fmt.Sprintf(
		"mongodb://%s:%s",
		c.Mongo.Host,
		c.Mongo.Port,
	)
}

func (c *Config) RabbitMQURI() string {
	return fmt.Sprintf(
		"amqp://%s:%s@%s:%s/",
		c.RabbitMQ.User,
		c.RabbitMQ.Password,
		c.RabbitMQ.Host,
		c.RabbitMQ.Port,
	)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}

	return fallback
}
