<?php

namespace Frieren\Integrate\Services;

use Frieren\Integrate\DTO\IntegrationEvent;
use Frieren\Integrate\Models\IntegrationOutbox;

final class OutboxService
{
    public function add(IntegrationEvent $event, ?string $routingKey = null): IntegrationOutbox
    {
        return IntegrationOutbox::query()->firstOrCreate(
            ['event_id' => $event->eventId],
            [
                'event_type' => $event->eventType->value,
                'routing_key' => $routingKey ?? $event->eventType->value,
                'payload' => $event->toArray(),
                'status' => 'pending',
                'attempts' => 0,
                'available_at' => now(),
            ],
        );
    }
}
