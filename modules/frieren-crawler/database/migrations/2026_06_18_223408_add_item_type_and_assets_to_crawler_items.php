<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('crawler_items', function (Blueprint $table): void {
            if (! Schema::hasColumn('crawler_items', 'item_type')) {
                $table->string('item_type')->default('unknown')->after('podcast_id')->index();
            }
        });

        DB::table('crawler_items')
            ->where(function ($query): void {
                $query->whereNull('item_type')->orWhere('item_type', 'unknown');
            })
            ->where('audio_count', '>', 0)
            ->update(['item_type' => 'podcast']);

        if (! Schema::hasTable('crawler_item_assets')) {
            Schema::create('crawler_item_assets', function (Blueprint $table): void {
                $table->id();

                $table->foreignId('crawler_item_id')
                    ->constrained('crawler_items')
                    ->cascadeOnDelete();

                $table->foreignId('last_crawler_run_id')
                    ->nullable()
                    ->constrained('crawler_runs')
                    ->nullOnDelete();

                $table->string('asset_type')->default('attachment')->index();
                $table->string('external_id')->nullable();
                $table->string('title')->nullable();
                $table->unsignedInteger('position')->nullable();

                $table->text('url');
                $table->char('url_hash', 64);

                $table->string('mime_type')->nullable();
                $table->unsignedInteger('duration_seconds')->nullable();
                $table->unsignedBigInteger('content_length')->nullable();
                $table->string('status')->default('active')->index();
                $table->json('metadata')->nullable();
                $table->text('error_message')->nullable();

                $table->timestamp('first_discovered_at')->nullable();
                $table->timestamp('last_crawled_at')->nullable();
                $table->timestamp('last_changed_at')->nullable();
                $table->timestamp('imported_at')->nullable();
                $table->timestamps();

                $table->unique(
                    ['crawler_item_id', 'url_hash'],
                    'crawler_item_assets_url_unique'
                );

                $table->unique(
                    ['crawler_item_id', 'external_id'],
                    'crawler_item_assets_external_id_unique'
                );

                $table->index(
                    ['crawler_item_id', 'asset_type', 'status'],
                    'crawler_item_assets_item_type_status_index'
                );
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('crawler_item_assets');

        Schema::table('crawler_items', function (Blueprint $table): void {
            if (Schema::hasColumn('crawler_items', 'item_type')) {
                $table->dropColumn('item_type');
            }
        });
    }
};
