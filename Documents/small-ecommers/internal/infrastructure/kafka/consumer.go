package kafka

import (
	"context"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/IBM/sarama"
)

// Consumer wraps Sarama ConsumerGroup
type Consumer struct {
	consumer sarama.ConsumerGroup
	handler  *ConsumerHandler
}

// ConsumerHandler implements sarama.ConsumerGroupHandler
type ConsumerHandler struct {
	processFunc func([]byte) error
}

// NewConsumerHandler creates a new consumer handler
func NewConsumerHandler(processFunc func([]byte) error) *ConsumerHandler {
	return &ConsumerHandler{processFunc: processFunc}
}

// Setup is called at the beginning of a new session
func (h *ConsumerHandler) Setup(sarama.ConsumerGroupSession) error {
	return nil
}

// Cleanup is called at the end of a session
func (h *ConsumerHandler) Cleanup(sarama.ConsumerGroupSession) error {
	return nil
}

// ConsumeClaim processes messages from a claim
func (h *ConsumerHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		if err := h.processFunc(msg.Value); err != nil {
			log.Printf("Error processing message: %v", err)
		} else {
			session.MarkMessage(msg, "")
		}
	}
	return nil
}

// NewConsumer creates a new Kafka consumer
func NewConsumer(brokers []string, groupID string, topics []string, handler *ConsumerHandler) (*Consumer, error) {
	config := sarama.NewConfig()
	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRoundRobin
	config.Consumer.Offsets.Initial = sarama.OffsetOldest

	consumer, err := sarama.NewConsumerGroup(brokers, groupID, config)
	if err != nil {
		return nil, err
	}

	log.Printf("Kafka consumer connected to brokers: %v", brokers)

	return &Consumer{
		consumer: consumer,
		handler:  handler,
	}, nil
}

// Start starts consuming messages
func (c *Consumer) Start(ctx context.Context, topics []string) {
	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case <-ctx.Done():
				return
			default:
				if err := c.consumer.Consume(ctx, topics, c.handler); err != nil {
					log.Printf("Consumer error: %v", err)
				}
			}
		}
	}()

	// Wait for interrupt signal
	sigterm := make(chan os.Signal, 1)
	signal.Notify(sigterm, syscall.SIGINT, syscall.SIGTERM)
	<-sigterm

	log.Println("Shutting down consumer...")
	wg.Wait()
	c.consumer.Close()
}

// Close closes the consumer connection
func (c *Consumer) Close() error {
	return c.consumer.Close()
}
