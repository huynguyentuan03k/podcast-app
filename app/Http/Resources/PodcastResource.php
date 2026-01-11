<?php

namespace App\Http\Resources;

use App\Models\Publisher;
use App\Services\PocastUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PodcastResource extends JsonResource
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
            'publisher' => new PublisherResource($this->whenLoaded('publisher')),
            'cover_image' => $this->cover_image
                ? PocastUploadService::getCoverImageUrl($this->slug, $this->cover_image)
                : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
