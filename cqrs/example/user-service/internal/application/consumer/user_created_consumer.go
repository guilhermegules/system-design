package consumer

import (
	"context"
	"encoding/json"
	"log"
	"userservice/internal/adapters/outbound/mongo"
	"userservice/internal/application/events"

	"github.com/rabbitmq/amqp091-go"
)

type UserCreatedConsumer struct {
	channel    *amqp091.Channel
	repository *mongo.UserReadRepository
}

func NewUserCreatedConsumer(channel *amqp091.Channel, repository *mongo.UserReadRepository) *UserCreatedConsumer {
	return &UserCreatedConsumer{channel, repository}
}

func (c *UserCreatedConsumer) Start(ctx context.Context) error {
	queue, err := c.channel.QueueDeclare(
		"user.created",
		true, // durable
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		log.Println("❌ Queue declare error:", err)
		return err
	}

	msgs, err := c.channel.Consume(
		queue.Name,
		"",
		false, // manual ack
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		log.Println("❌ Queue consume error:", err)
		return err
	}

	go func() {
		for {
			select {
			case <-ctx.Done():
				return

			case msg := <-msgs:
				var event events.UserCreated
				if err := json.Unmarshal(msg.Body, &event); err != nil {
					log.Println("❌ Invalid message:", err)
					_ = msg.Nack(false, false)
					continue
				}

				err := c.repository.Upsert(ctx, mongo.UserDocument{
					ID:    event.ID,
					Name:  event.Name,
					Email: event.Email,
				})

				if err != nil {
					log.Println("❌ Mongo write failed:", err)
					_ = msg.Nack(false, true) // retry
					continue
				}

				_ = msg.Ack(false)
				log.Println("✅ User synced to Mongo:", event.ID)
			}
		}
	}()

	return nil
}
