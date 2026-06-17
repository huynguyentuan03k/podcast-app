<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crawler_item_audios', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('crawler_item_id')
                ->constrained('crawler_items')
                ->cascadeOnDelete();

            $table->foreignId('last_crawler_run_id')
                ->nullable()
                ->constrained('crawler_runs')
                ->nullOnDelete();

            // Mỗi audio thường được import thành một episode.
            $table->foreignId('episode_id')
                ->nullable()
                ->constrained('episodes')
                ->nullOnDelete();

            $table->string('external_id')->nullable();
            $table->string('title')->nullable();
            $table->unsignedInteger('position')->nullable();

            $table->text('audio_url');
            $table->char('audio_url_hash', 64);

            $table->unsignedInteger('http_status')->nullable();
            $table->string('content_type')->nullable();
            $table->unsignedBigInteger('content_length')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();

            // active | missing | invalid | imported | duplicate | failed
            $table->string('status')->default('active')->index();

            $table->foreignId('duplicate_of_id')
                ->nullable()
                ->constrained('crawler_item_audios')
                ->nullOnDelete();

            $table->char('content_hash', 64)->nullable()->index();
            $table->json('metadata')->nullable();
            $table->text('error_message')->nullable();

            $table->unsignedInteger('crawl_count')->default(0);
            $table->unsignedInteger('failure_count')->default(0);

            $table->timestamp('first_discovered_at')->nullable();
            $table->timestamp('last_crawled_at')->nullable();
            $table->timestamp('last_changed_at')->nullable();
            $table->timestamp('imported_at')->nullable();
            $table->timestamps();

            // Một item không lưu trùng cùng một URL audio.
            $table->unique(
                ['crawler_item_id', 'audio_url_hash'],
                'crawler_item_audios_url_unique'
            );

            $table->index(
                ['crawler_item_id', 'position'],
                'crawler_item_audios_position_index'
            );

            $table->index(
                ['crawler_item_id', 'status'],
                'crawler_item_audios_item_status_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawler_item_audios');
    }
};
