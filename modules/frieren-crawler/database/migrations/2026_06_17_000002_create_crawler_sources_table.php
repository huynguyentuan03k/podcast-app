<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('crawler_profiles')) {
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

        if (Schema::hasTable('crawler_sources')) {
            Schema::table('crawler_sources', function (Blueprint $table): void {
                if (! Schema::hasColumn('crawler_sources', 'crawler_profile_id')) {
                    $table->foreignId('crawler_profile_id')
                        ->nullable()
                        ->after('id')
                        ->constrained('crawler_profiles')
                        ->nullOnDelete();
                }

                if (! Schema::hasColumn('crawler_sources', 'base_url')) {
                    $table->text('base_url')->nullable()->after('type');
                }

                if (! Schema::hasColumn('crawler_sources', 'host')) {
                    $table->string('host')->nullable()->after('base_url');
                }

                if (! Schema::hasColumn('crawler_sources', 'options_override')) {
                    $table->json('options_override')->nullable()->after('status');
                }

                if (! Schema::hasColumn('crawler_sources', 'start_urls')) {
                    $table->json('start_urls')->nullable()->after('options_override');
                }
            });

            $sources = DB::table('crawler_sources')->get(['id', 'url', 'options', 'base_url', 'host']);

            foreach ($sources as $source) {
                $baseUrl = $source->base_url ?: $source->url;
                $host = $source->host ?: parse_url((string) $baseUrl, PHP_URL_HOST);

                DB::table('crawler_sources')
                    ->where('id', $source->id)
                    ->update([
                        'base_url' => $baseUrl,
                        'host' => $host ?: 'source-' . $source->id . '.local',
                        'options_override' => $source->options,
                    ]);
            }

            return;
        }

        Schema::create('crawler_sources', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('crawler_profile_id')
                ->nullable()
                ->constrained('crawler_profiles')
                ->nullOnDelete();

            $table->string('name');
            $table->string('type')->default('website')->index();
            $table->text('base_url');
            $table->string('host')->unique();
            $table->string('status')->default('active')->index();

            // Cấu hình riêng của website, ghi đè options trong profile.
            $table->json('options_override')->nullable();

            // Có thể dùng sau này nếu source hỗ trợ discovery tự động.
            $table->json('start_urls')->nullable();

            $table->timestamp('last_crawled_at')->nullable();
            $table->timestamps();

            $table->index(['crawler_profile_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawler_sources');
    }
};
