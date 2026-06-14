<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('episode_audio_tracks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('episode_id')->constrained()->cascadeOnDelete();
            $table->foreignId('language_id')->constrained('podcast_languages')->cascadeOnDelete();
            $table->text('audio_url');
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('bitrate')->nullable();
            $table->boolean('is_primary')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['episode_id', 'language_id']);
            $table->index(['language_id', 'is_primary']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('episode_audio_tracks');
    }
};
