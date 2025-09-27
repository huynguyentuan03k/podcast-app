<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class CreateEpisodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

// CreateEpisodeRequest.php
public function rules(): array
{
    return [
        'title' => ['required', 'string', 'unique:episodes,title'],
        'description' => ['nullable', 'string'],
        'audio_path' => ['nullable'], // Comment out
        'duration' => ['nullable', 'integer'],
        'slug' => ['required', 'string'],
        'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        'podcast_id' => ['required', 'integer', 'exists:podcasts,id'],
    ];
}

}
