<?php

namespace Frieren\Integrate\Models;

use Illuminate\Database\Eloquent\Model;

class ImportBatch extends Model
{
    protected $table = 'integration_import_batches';

    protected $fillable = [
        'external_job_id', 'source_url', 'entity_type', 'status',
        'normalized_data', 'validation_result', 'rejection_reason',
    ];

    protected $casts = [
        'normalized_data' => 'array',
        'validation_result' => 'array',
    ];
}
