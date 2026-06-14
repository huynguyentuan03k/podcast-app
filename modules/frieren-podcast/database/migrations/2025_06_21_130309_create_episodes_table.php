<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('episodes', function (Blueprint $table) {
            $table->id();

            $table->timestamps();

            $table->string('slug')->nullable()->unique();
            $table->string('title')->nullable();
            $table->string('description')->nullable();
            $table->string('audio_path')->nullable();
            $table->integer('duration')->nullable();
            $table->integer('file_size')->nullable();
            $table->string('mime_type')->nullable();

            $table->foreignId('podcast_id')->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};
