<?php

use Spatie\Activitylog\Models\Activity;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('activities api works', function () {
    $activity = Activity::create([
        'log_name' => 'default',
        'description' => 'created',
        'subject_type' => 'test',
        'subject_id' => 1,
        'causer_type' => null,
        'causer_id' => null,
        'properties' => null,
        'event' => 'created',
    ]);

    $this->getJson('/api/activities')->assertOk();
    $this->getJson("/api/activities/{$activity->id}")->assertOk();
});
