<?php

namespace Frieren\Integrate\RabbitMQ;

use Frieren\Integrate\Contracts\EventPublisher;
use Frieren\Integrate\DTO\IntegrationEvent;
use PhpAmqpLib\Message\AMQPMessage;

final class RabbitMqPublisher implements EventPublisher
{
    public function __construct(private readonly RabbitMqConnectionFactory $connections) {}

    public function publish(IntegrationEvent $event): void
    {
        $connection = $this->connections->make();
        $channel = $connection->channel();
        $exchange = config('integrate.rabbitmq.exchange');

        try {
            $channel->exchange_declare($exchange, 'topic', false, true, false);
            $channel->confirm_select();

            $message = new AMQPMessage(
                json_encode($event->toArray(), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
                [
                    'content_type' => 'application/json',
                    'delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT,
                    'message_id' => $event->eventId,
                    'type' => $event->eventType->value,
                    'timestamp' => $event->occurredAt->getTimestamp(),
                    'correlation_id' => $event->correlationId ?? '',
                ],
            );

            $channel->basic_publish($message, $exchange, $event->eventType->value);
            $channel->wait_for_pending_acks_returns(5.0);
        } finally {
            $channel->close();
            $connection->close();
        }
    }
}
