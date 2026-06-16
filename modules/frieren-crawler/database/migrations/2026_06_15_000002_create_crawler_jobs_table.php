<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crawler_jobs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('crawler_source_id')->nullable()->constrained('crawler_sources')->nullOnDelete();
            $table->string('external_job_id')->nullable()->index();
            $table->text('target_url');
            $table->string('status')->default('draft')->index();
            $table->json('payload')->nullable();
            $table->json('response')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawler_jobs');
    }
};
