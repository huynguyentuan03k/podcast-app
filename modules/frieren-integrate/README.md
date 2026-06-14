# frieren-integrate

Module Laravel phụ trách integration giữa crawler, RabbitMQ và các module nghiệp vụ.

## Phạm vi bản đầu

- Nhận `crawler.job.completed` và `crawler.job.failed` qua HTTP.
- Xác thực Bearer token.
- Idempotency bằng `event_id` trong inbox.
- Tạo import draft khi crawler hoàn tất.
- Transactional outbox.
- Publish event lên RabbitMQ topic exchange `frieren.events`.
- Command khai báo exchange/queue/binding.
- Command chạy outbox worker bằng Supervisor, không cần Docker.

## Cài vào dự án Laravel

### Cách 1: path repository

Đặt module tại:

```text
modules/frieren-integrate
```

Thêm vào `composer.json` của Laravel:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "modules/frieren-integrate"
    }
  ],
  "require": {
    "frieren/integrate": "@dev"
  }
}
```

Sau đó:

```bash
composer update frieren/integrate
php artisan migrate
php artisan integrate:rabbitmq:setup
```

Copy biến môi trường từ `.env.example` vào `.env` của Laravel.

## Endpoint crawler

```http
POST /api/integrations/crawler/events
Authorization: Bearer <FRIEREN_INTEGRATE_TOKEN>
Content-Type: application/json
```

Ví dụ:

```json
{
  "eventId": "ad57feef-7d10-47aa-887e-d88ab82a1fa5",
  "eventType": "crawler.job.completed",
  "eventVersion": 1,
  "occurredAt": "2026-06-14T16:30:00+00:00",
  "producer": "frieren-crawler",
  "correlationId": "crawl_job_123",
  "causationId": null,
  "traceId": "trace_123",
  "data": {
    "jobId": "crawl_job_123",
    "sourceUrl": "https://example.com/podcast",
    "entityType": "podcast",
    "normalizedData": {
      "title": "Podcast title",
      "episodes": []
    }
  },
  "metadata": {
    "environment": "local"
  }
}
```

Response mới:

```json
{
  "status": "accepted",
  "eventId": "ad57feef-7d10-47aa-887e-d88ab82a1fa5"
}
```

Request lặp cùng `eventId` trả `already_received`.

## Chạy Outbox worker

Kiểm tra một batch:

```bash
php artisan integrate:outbox:publish --once
```

Chạy liên tục trên production bằng Supervisor:

```bash
sudo cp supervisor-frieren-integrate.conf.example /etc/supervisor/conf.d/frieren-integrate.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start frieren-integrate-outbox:*
```

## Event contract

Các event được khai báo sẵn:

- `crawler.job.completed`
- `crawler.job.failed`
- `import.completed`
- `import.rejected`
- `episode.published`
- `episode.audio.unavailable`

## Bước tiếp theo

- Consumer RabbitMQ và handler registry.
- API admin duyệt/từ chối import.
- Event `import.completed` / `import.rejected` phát từ transaction nghiệp vụ.
- Webhook subscriptions và delivery retries.
- Audio health checker.
