<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('podcast_languages', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('native_name');
            $table->string('english_name');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        DB::table('podcast_languages')->insert([
            [
                'code' => 'vi',
                'native_name' => 'Tieng Viet',
                'english_name' => 'Vietnamese',
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'en',
                'native_name' => 'English',
                'english_name' => 'English',
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ja',
                'native_name' => 'Nihongo',
                'english_name' => 'Japanese',
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('podcast_languages');
    }
};
