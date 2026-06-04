<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_admin_has_roles')) {
            return;
        }

        Schema::create('user_admin_has_roles', function (Blueprint $table) {
            $table->foreignId('user_admin_id')->constrained('users_admin')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->primary(['user_admin_id', 'role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_admin_has_roles');
    }
};
