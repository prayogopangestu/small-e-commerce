package kafka

import (
	"context"
	"encoding/json"
	"log"

	"github.com/IBM/sarama"
)

// Producer wraps Sarama SyncProducer
type Producer struct {
	producer sarama.SyncProducer
	brokers  []string
}

// NewProducer creates a new Kafka producer
func NewProducer(brokers []string) (*Producer, error) {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Return.Successes = true
	config.Producer.Return.Errors = true

	producer, err := sarama.NewSyncProducer(brokers, config)
	if err != nil {
		return nil, err
	}

	log.Printf("Kafka producer connected to brokers: %v", brokers)

	return &Producer{
		producer: producer,
		brokers:  brokers,
	}, nil
}

// PublishOrderCreated publishes an order.created event
func (p *Producer) PublishOrderCreated(ctx context.Context, order map[string]interface{}) error {
	data, err := json.Marshal(order)
	if err != nil {
		return err
	}

	msg := &sarama.ProducerMessage{
		Topic: "order.created",
		Key:   sarama.StringEncoder(order["id"].(string)),
		Value: sarama.ByteEncoder(data),
	}

	partition, offset, err := p.producer.SendMessage(msg)
	if err != nil {
		return err
	}

	log.Printf("Order event published to partition %d at offset %d", partition, offset)

	return nil
}

// Close closes the producer connection
func (p *Producer) Close() error {
	return p.producer.Close()
}
