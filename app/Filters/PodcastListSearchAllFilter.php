<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;
use App\Utils;

class PodcastListSearchAllFilter implements Filter
{
    public function __invoke(Builder $query, mixed $value, string $property): void
    {
        $escaped = Utils::escapeLike($value);

        $query->where(function ($q) use ($escaped) {
            $q->where('title', 'like', "%{$escaped}%")
                ->orWhere('slug', 'like', "%{$escaped}%")
                ->orWhere('description', 'like', "%{$escaped}%");
        });
    }
}
