<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_preferences')) {
            return;
        }

        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('language', 16)->default('en');
            $table->string('theme', 32)->default('system');
            $table->boolean('notification_enabled')->default(true);
            $table->boolean('email_notification_enabled')->default(true);
            $table->boolean('push_notification_enabled')->default(true);
            $table->boolean('autoplay_enabled')->default(false);
            $table->decimal('playback_speed', 3, 2)->default(1);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
