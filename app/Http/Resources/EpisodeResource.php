<?php

namespace App\Http\Resources;

use App\Services\EpisodeUploadService;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EpisodeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'publisher_id' => $this->publisher_id,
            'cover_image' => $this->cover_image ? EpisodeUploadService::getCoverImageUrl($this->slug, $this->cover_image) : 'default',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
