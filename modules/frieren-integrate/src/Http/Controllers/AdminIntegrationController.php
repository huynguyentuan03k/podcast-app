<?php

namespace Frieren\Integrate\Http\Controllers;

use Frieren\Integrate\Models\ImportBatch;
use Frieren\Integrate\Models\IntegrationInbox;
use Frieren\Integrate\Models\IntegrationOutbox;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Artisan;

final class AdminIntegrationController extends Controller
{
    public function overview(): JsonResponse
    {
        return response()->json([
            'data' => [
                'enabled' => (bool) config('integrate.enabled'),
                'api_prefix' => config('integrate.api.prefix'),
                'rabbitmq' => [
                    'host' => config('integrate.rabbitmq.host'),
                    'port' => config('integrate.rabbitmq.port'),
                    'vhost' => config('integrate.rabbitmq.vhost'),
                    'exchange' => config('integrate.rabbitmq.exchange'),
                    'queue' => config('integrate.consumer.queue'),
                ],
                'metrics' => [
                    'inbox_total' => IntegrationInbox::query()->count(),
                    'inbox_received' => IntegrationInbox::query()->where('status', 'received')->count(),
                    'outbox_pending' => IntegrationOutbox::query()->where('status', 'pending')->count(),
                    'outbox_published' => IntegrationOutbox::query()->where('status', 'published')->count(),
                    'outbox_failed' => IntegrationOutbox::query()->where('status', 'failed')->count(),
                    'batches_waiting_review' => ImportBatch::query()->where('status', 'waiting_review')->count(),
                    'batches_imported' => ImportBatch::query()->where('status', 'imported')->count(),
                    'batches_failed' => ImportBatch::query()->where('status', 'failed')->count(),
                ],
            ],
        ]);
    }

    public function importBatches(Request $request): JsonResponse
    {
        $query = ImportBatch::query()->latest('id');

        $this->applyCommonFilters($query, $request, ['external_job_id', 'source_url', 'entity_type', 'status']);

        return response()->json($query->paginate($this->perPage($request)));
    }

    public function inbox(Request $request): JsonResponse
    {
        $query = IntegrationInbox::query()->latest('id');

        $this->applyCommonFilters($query, $request, ['event_id', 'event_type', 'producer', 'status']);

        return response()->json($query->paginate($this->perPage($request)));
    }

    public function outbox(Request $request): JsonResponse
    {
        $query = IntegrationOutbox::query()->latest('id');

        $this->applyCommonFilters($query, $request, ['event_id', 'event_type', 'routing_key', 'status']);

        return response()->json($query->paginate($this->perPage($request)));
    }

    public function importBatch(ImportBatch $importBatch): JsonResponse
    {
        return response()->json(['data' => $importBatch]);
    }

    public function updateImportBatchStatus(Request $request, ImportBatch $importBatch): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:received,validating,waiting_review,approved,rejected,importing,imported,failed'],
            'rejection_reason' => ['nullable', 'string', 'max:2000'],
        ]);

        $importBatch->forceFill([
            'status' => $data['status'],
            'rejection_reason' => $data['status'] === 'rejected' ? ($data['rejection_reason'] ?? null) : $importBatch->rejection_reason,
        ])->save();

        return response()->json(['data' => $importBatch->refresh()]);
    }

    public function retryOutbox(IntegrationOutbox $outbox): JsonResponse
    {
        $outbox->forceFill([
            'status' => 'pending',
            'available_at' => now(),
            'last_error' => null,
        ])->save();

        return response()->json(['data' => $outbox->refresh()]);
    }

    public function publishOutboxOnce(): JsonResponse
    {
        $exitCode = Artisan::call('integrate:outbox:publish', ['--once' => true]);

        return response()->json([
            'data' => [
                'exit_code' => $exitCode,
                'output' => trim(Artisan::output()),
            ],
        ], $exitCode === 0 ? 200 : 500);
    }

    public function setupRabbitMq(): JsonResponse
    {
        $exitCode = Artisan::call('integrate:rabbitmq:setup');

        return response()->json([
            'data' => [
                'exit_code' => $exitCode,
                'output' => trim(Artisan::output()),
            ],
        ], $exitCode === 0 ? 200 : 500);
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->query('per_page', 10), 1), 100);
    }

    /**
     * @param \Illuminate\Database\Eloquent\Builder<\Illuminate\Database\Eloquent\Model> $query
     * @param array<int, string> $columns
     */
    private function applyCommonFilters($query, Request $request, array $columns): void
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($search === '') {
            return;
        }

        $query->where(function ($query) use ($columns, $search): void {
            foreach ($columns as $column) {
                if ($column === 'event_id') {
                    $query->orWhereRaw('CAST(event_id AS TEXT) LIKE ?', ["%{$search}%"]);
                    continue;
                }

                $query->orWhere($column, 'like', "%{$search}%");
            }
        });
    }
}
