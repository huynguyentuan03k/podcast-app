<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crawler_sources', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('type')->default('generic');
            $table->text('url');
            $table->string('status')->default('active');
            $table->json('selectors')->nullable();
            $table->json('options')->nullable();
            $table->timestamp('last_crawled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawler_sources');
    }
};
