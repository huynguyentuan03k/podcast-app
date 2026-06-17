<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crawler_items', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('crawler_source_id')
                ->constrained('crawler_sources')
                ->cascadeOnDelete();

            $table->foreignId('last_crawler_run_id')
                ->nullable()
                ->constrained('crawler_runs')
                ->nullOnDelete();

            // Một crawler item thường được import thành một podcast.
            $table->foreignId('podcast_id')
                ->nullable()
                ->constrained('podcasts')
                ->nullOnDelete();

            $table->string('external_id')->nullable();
            $table->string('title')->nullable();
            $table->string('normalized_title')->nullable()->index();
            $table->string('slug')->nullable();

            // URL trang HTML được nhập thủ công hoặc discovery tìm thấy.
            $table->text('source_url');
            $table->char('source_url_hash', 64);

            $table->text('canonical_url')->nullable();
            $table->char('canonical_url_hash', 64)->nullable()->index();

            $table->text('description')->nullable();
            $table->text('thumbnail_url')->nullable();

            // discovered | pending | processing | ready | imported | duplicate | skipped | failed
            $table->string('status')->default('pending')->index();

            $table->foreignId('duplicate_of_id')
                ->nullable()
                ->constrained('crawler_items')
                ->nullOnDelete();

            $table->unsignedInteger('audio_count')->default(0);
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

            $table->unique(
                ['crawler_source_id', 'source_url_hash'],
                'crawler_items_source_url_unique'
            );

            $table->unique(
                ['crawler_source_id', 'external_id'],
                'crawler_items_external_id_unique'
            );

            $table->index(
                ['crawler_source_id', 'status', 'last_crawled_at'],
                'crawler_items_source_status_crawled_index'
            );
        });

        DB::table('crawler_sources')
            ->whereNotNull('base_url')
            ->orderBy('id')
            ->get(['id', 'base_url'])
            ->each(function ($source): void {
                DB::table('crawler_items')->insertOrIgnore([
                    'crawler_source_id' => $source->id,
                    'source_url' => $source->base_url,
                    'source_url_hash' => hash('sha256', (string) $source->base_url),
                    'status' => 'pending',
                    'first_discovered_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawler_items');
    }
};
