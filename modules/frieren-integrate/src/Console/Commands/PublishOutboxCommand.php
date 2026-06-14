<?php

namespace Frieren\Integrate\Console\Commands;

use Frieren\Integrate\Contracts\EventPublisher;
use Frieren\Integrate\DTO\IntegrationEvent;
use Frieren\Integrate\Models\IntegrationOutbox;
use Illuminate\Console\Command;
use Throwable;

final class PublishOutboxCommand extends Command
{
    protected $signature = 'integrate:outbox:publish {--once : Process one batch and exit}';
    protected $description = 'Publish pending integration outbox events to RabbitMQ.';

    public function handle(EventPublisher $publisher): int
    {
        do {
            $processed = 0;

            IntegrationOutbox::query()
                ->where('status', 'pending')
                ->where('available_at', '<=', now())
                ->orderBy('id')
                ->limit((int) config('integrate.outbox.batch_size', 100))
                ->get()
                ->each(function (IntegrationOutbox $row) use ($publisher, &$processed): void {
                    try {
                        $publisher->publish(IntegrationEvent::fromArray($row->payload));
                        $row->forceFill([
                            'status' => 'published',
                            'published_at' => now(),
                            'last_error' => null,
                        ])->save();
                        $processed++;
                    } catch (Throwable $e) {
                        $attempts = $row->attempts + 1;
                        $row->forceFill([
                            'attempts' => $attempts,
                            'status' => $attempts >= (int) config('integrate.outbox.max_attempts', 10) ? 'failed' : 'pending',
                            'available_at' => now()->addSeconds(min(1800, 2 ** min($attempts, 10))),
                            'last_error' => mb_substr($e->getMessage(), 0, 2000),
                        ])->save();

                        $this->error("Failed {$row->event_id}: {$e->getMessage()}");
                    }
                });

            if (!$this->option('once') && $processed === 0) {
                usleep(500_000);
            }
        } while (!$this->option('once'));

        return self::SUCCESS;
    }
}
