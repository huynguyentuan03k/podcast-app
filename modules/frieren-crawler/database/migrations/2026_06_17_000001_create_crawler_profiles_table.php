<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crawler_profiles', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('key')->unique();
            $table->string('driver')->default('website')->index();
            $table->unsignedInteger('version')->default(1);
            $table->json('selectors')->nullable();
            $table->json('options')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawler_profiles');
    }
};
