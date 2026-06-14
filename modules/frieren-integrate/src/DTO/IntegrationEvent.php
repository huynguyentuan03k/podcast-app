<?php

namespace Frieren\Integrate\DTO;

use DateTimeImmutable;
use Frieren\Integrate\Enums\IntegrationEventType;
use Illuminate\Support\Str;
use InvalidArgumentException;

final readonly class IntegrationEvent
{
    public function __construct(
        public string $eventId,
        public IntegrationEventType $eventType,
        public int $eventVersion,
        public DateTimeImmutable $occurredAt,
        public string $producer,
        public ?string $correlationId,
        public ?string $causationId,
        public ?string $traceId,
        public array $data,
        public array $metadata = [],
    ) {}

    public static function create(
        IntegrationEventType $eventType,
        string $producer,
        array $data,
        ?string $correlationId = null,
        ?string $causationId = null,
        ?string $traceId = null,
        int $eventVersion = 1,
        array $metadata = [],
    ): self {
        return new self(
            eventId: (string) Str::uuid(),
            eventType: $eventType,
            eventVersion: $eventVersion,
            occurredAt: new DateTimeImmutable(),
            producer: $producer,
            correlationId: $correlationId,
            causationId: $causationId,
            traceId: $traceId,
            data: $data,
            metadata: $metadata,
        );
    }

    public static function fromArray(array $payload): self
    {
        foreach (['eventId', 'eventType', 'eventVersion', 'occurredAt', 'producer', 'data'] as $required) {
            if (!array_key_exists($required, $payload)) {
                throw new InvalidArgumentException("Missing event field: {$required}");
            }
        }

        return new self(
            eventId: (string) $payload['eventId'],
            eventType: IntegrationEventType::from((string) $payload['eventType']),
            eventVersion: (int) $payload['eventVersion'],
            occurredAt: new DateTimeImmutable((string) $payload['occurredAt']),
            producer: (string) $payload['producer'],
            correlationId: isset($payload['correlationId']) ? (string) $payload['correlationId'] : null,
            causationId: isset($payload['causationId']) ? (string) $payload['causationId'] : null,
            traceId: isset($payload['traceId']) ? (string) $payload['traceId'] : null,
            data: (array) $payload['data'],
            metadata: (array) ($payload['metadata'] ?? []),
        );
    }

    public function toArray(): array
    {
        return [
            'eventId' => $this->eventId,
            'eventType' => $this->eventType->value,
            'eventVersion' => $this->eventVersion,
            'occurredAt' => $this->occurredAt->format(DATE_ATOM),
            'producer' => $this->producer,
            'correlationId' => $this->correlationId,
            'causationId' => $this->causationId,
            'traceId' => $this->traceId,
            'data' => $this->data,
            'metadata' => $this->metadata,
        ];
    }
}
