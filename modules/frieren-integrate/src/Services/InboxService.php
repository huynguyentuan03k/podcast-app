<?php

namespace Frieren\Integrate\Services;

use Frieren\Integrate\DTO\IntegrationEvent;
use Frieren\Integrate\Models\IntegrationInbox;
use Illuminate\Database\QueryException;

final class InboxService
{
    public function receive(IntegrationEvent $event): IntegrationInbox
    {
        try {
            return IntegrationInbox::query()->create([
                'event_id' => $event->eventId,
                'event_type' => $event->eventType->value,
                'producer' => $event->producer,
                'payload' => $event->toArray(),
                'status' => 'received',
                'received_at' => now(),
            ]);
        } catch (QueryException $e) {
            $existing = IntegrationInbox::query()->where('event_id', $event->eventId)->first();
            if ($existing) {
                return $existing;
            }
            throw $e;
        }
    }
}
