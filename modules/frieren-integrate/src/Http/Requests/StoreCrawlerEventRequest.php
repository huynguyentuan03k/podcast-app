<?php

namespace Frieren\Integrate\Http\Requests;

use Frieren\Integrate\Enums\IntegrationEventType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCrawlerEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'eventId' => ['required', 'uuid'],
            'eventType' => ['required', Rule::in([
                IntegrationEventType::CrawlerJobCompleted->value,
                IntegrationEventType::CrawlerJobFailed->value,
            ])],
            'eventVersion' => ['required', 'integer', 'min:1'],
            'occurredAt' => ['required', 'date'],
            'producer' => ['required', 'string', 'max:100'],
            'correlationId' => ['nullable', 'string', 'max:150'],
            'causationId' => ['nullable', 'string', 'max:150'],
            'traceId' => ['nullable', 'string', 'max:150'],
            'data' => ['required', 'array'],
            'metadata' => ['sometimes', 'array'],
        ];
    }
}
