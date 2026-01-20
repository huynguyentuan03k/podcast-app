<?php

namespace App\Http\Resources;

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
            'categories' =>  CategoryResource::collection($this->whenLoaded('categories')),
            'authors' => AuthorResource::collection($this->whenLoaded('authors')),
            'cover_image' => $this->cover_image,
            'content' => $this->content,
            'cover_url' => $this->cover_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
