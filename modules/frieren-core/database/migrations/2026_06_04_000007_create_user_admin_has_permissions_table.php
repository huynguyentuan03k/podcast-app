<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_admin_has_permissions')) {
            return;
        }

        Schema::create('user_admin_has_permissions', function (Blueprint $table) {
            $table->foreignId('user_admin_id')->constrained('users_admin')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->primary(['user_admin_id', 'permission_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_admin_has_permissions');
    }
};
