<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

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
        'audio_path' => ['nullable',
         File::types(['audio/mp3','audio/wav','audio/mpeg'])->max(120 * 1024)
        ],
        'slug' => ['required', 'string'],
        'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        'podcast_id' => ['required', 'integer', 'exists:podcasts,id'],
    ];
}

}
