<?php

namespace Frieren\Integrate\Http\Controllers;

use Frieren\Integrate\DTO\IntegrationEvent;
use Frieren\Integrate\Http\Requests\StoreCrawlerEventRequest;
use Frieren\Integrate\Services\EventIngestionService;
use Illuminate\Http\JsonResponse;

final class CrawlerEventController
{
    public function store(
        StoreCrawlerEventRequest $request,
        EventIngestionService $service,
    ): JsonResponse {
        $event = IntegrationEvent::fromArray($request->validated());
        $result = $service->ingest($event);

        return response()->json([
            'status' => $result['duplicate'] ? 'already_received' : 'accepted',
            'eventId' => $event->eventId,
        ], $result['duplicate'] ? 200 : 202);
    }
}
