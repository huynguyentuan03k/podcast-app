<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('podcast_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('podcast_id')->constrained()->cascadeOnDelete();
            $table->foreignId('language_id')->constrained('podcast_languages')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['podcast_id', 'language_id']);
            $table->unique(['language_id', 'slug']);
            $table->index(['language_id', 'title']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('podcast_translations');
    }
};
