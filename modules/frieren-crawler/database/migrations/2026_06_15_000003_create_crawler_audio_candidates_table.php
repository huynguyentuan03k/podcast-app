<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crawler_audio_candidates', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('crawler_job_id')->nullable()->constrained('crawler_jobs')->nullOnDelete();
            $table->foreignId('crawler_source_id')->nullable()->constrained('crawler_sources')->nullOnDelete();
            $table->foreignId('podcast_id')->nullable()->constrained('podcasts')->nullOnDelete();
            $table->foreignId('episode_id')->nullable()->constrained('episodes')->nullOnDelete();
            $table->string('title')->nullable();
            $table->string('slug')->nullable();
            $table->text('audio_url');
            $table->string('status')->default('pending')->index();
            $table->unsignedInteger('http_status')->nullable();
            $table->string('content_type')->nullable();
            $table->unsignedBigInteger('content_length')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->timestamp('imported_at')->nullable();
            $table->timestamps();

            $table->unique(['podcast_id', 'audio_url']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawler_audio_candidates');
    }
};
