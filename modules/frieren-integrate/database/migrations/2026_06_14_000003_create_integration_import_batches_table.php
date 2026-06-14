<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('integration_import_batches', function (Blueprint $table): void {
            $table->id();
            $table->string('external_job_id', 150)->unique();
            $table->text('source_url')->nullable();
            $table->string('entity_type', 100)->index();
            $table->string('status', 50)->default('received')->index();
            $table->json('normalized_data')->nullable();
            $table->json('validation_result')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_import_batches');
    }
};
