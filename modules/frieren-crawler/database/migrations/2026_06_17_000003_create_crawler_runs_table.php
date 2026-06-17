<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crawler_runs', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('crawler_source_id')
                ->constrained('crawler_sources')
                ->cascadeOnDelete();

            // Profile thực tế được dùng khi bắt đầu run.
            $table->foreignId('crawler_profile_id')
                ->nullable()
                ->constrained('crawler_profiles')
                ->nullOnDelete();

            // crawl | recrawl
            $table->string('mode')->default('crawl')->index();

            // selected | pending | failed | oldest | all
            $table->string('selection')->default('selected')->index();

            $table->unsignedBigInteger('requested_count')->nullable();
            $table->unsignedBigInteger('processed_count')->default(0);
            $table->unsignedBigInteger('created_count')->default(0);
            $table->unsignedBigInteger('updated_count')->default(0);
            $table->unsignedBigInteger('duplicate_count')->default(0);
            $table->unsignedBigInteger('failed_count')->default(0);
            $table->unsignedBigInteger('skipped_count')->default(0);

            // pending | running | paused | completed | failed | cancelled
            $table->string('status')->default('pending')->index();

            // Snapshot để run không bị ảnh hưởng nếu profile được chỉnh giữa lúc chạy.
            $table->json('profile_snapshot')->nullable();
            $table->json('options')->nullable();
            $table->json('cursor')->nullable();
            $table->text('error_message')->nullable();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->index(['crawler_source_id', 'mode', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawler_runs');
    }
};
