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
        Schema::create('author_podcast', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained()->cascadeOnDelete();
            $table->foreignId('podcast_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['podcast_id','author_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('author_podcast');
    }
};
