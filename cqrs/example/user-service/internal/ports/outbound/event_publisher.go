package outbound

type EventPublisher interface {
	Publish(event string, payload any) error
}
