<?php

namespace Frieren\Integrate\Services;

use Frieren\Integrate\DTO\IntegrationEvent;
use Frieren\Integrate\Enums\IntegrationEventType;
use Frieren\Integrate\Models\ImportBatch;
use Illuminate\Support\Facades\DB;

final class EventIngestionService
{
    public function __construct(
        private readonly InboxService $inbox,
        private readonly OutboxService $outbox,
    ) {}

    public function ingest(IntegrationEvent $event): array
    {
        return DB::transaction(function () use ($event): array {
            $inbox = $this->inbox->receive($event);

            if ($inbox->status === 'processed') {
                return ['duplicate' => true, 'inbox_id' => $inbox->getKey()];
            }

            if ($event->eventType === IntegrationEventType::CrawlerJobCompleted) {
                ImportBatch::query()->firstOrCreate(
                    ['external_job_id' => (string) ($event->data['jobId'] ?? $event->correlationId ?? $event->eventId)],
                    [
                        'source_url' => $event->data['sourceUrl'] ?? null,
                        'entity_type' => $event->data['entityType'] ?? 'unknown',
                        'status' => 'waiting_review',
                        'normalized_data' => $event->data['normalizedData'] ?? $event->data,
                        'validation_result' => $event->data['validation'] ?? null,
                    ],
                );
            }

            $this->outbox->add($event);

            $inbox->forceFill([
                'status' => 'processed',
                'processed_at' => now(),
                'error_message' => null,
            ])->save();

            return ['duplicate' => false, 'inbox_id' => $inbox->getKey()];
        });
    }
}
