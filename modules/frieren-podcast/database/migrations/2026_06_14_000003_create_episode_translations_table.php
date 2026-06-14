<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('episode_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('episode_id')->constrained()->cascadeOnDelete();
            $table->foreignId('language_id')->constrained('podcast_languages')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->longText('transcript')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['episode_id', 'language_id']);
            $table->unique(['language_id', 'slug']);
            $table->index(['language_id', 'title']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('episode_translations');
    }
};
