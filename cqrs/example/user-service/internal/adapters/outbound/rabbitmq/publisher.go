package rabbitmq

import (
	"encoding/json"

	"github.com/rabbitmq/amqp091-go"
)

type Publisher struct {
	channel *amqp091.Channel
}

func NewPublisher(channel *amqp091.Channel) *Publisher {
	return &Publisher{channel}
}

func (p *Publisher) Publish(event string, payload any) error {
	body, _ := json.Marshal(payload)

	return p.channel.Publish(
		"",
		event,
		false,
		false,
		amqp091.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
}
