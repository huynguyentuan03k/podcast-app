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
        'audio_path' => ['nullable','string','url',
        'file' => ['nullable','mimes:mp3,wav,mpeg','max:122880']
        ],
        'duration' =>['nullable','integer'],
        'slug' => ['required', 'string'],
        'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        'podcast_id' => ['required', 'integer', 'exists:podcasts,id'],

        // nested
        'episodes' => ['nullable'],
        'episodes.*.title' => ['required','string','max:255'],
        'episodes.*.slug' => ['required','string','max:255'],
        'episodes.*.podcast_id' => ['required','integer','exists:podcasts,id'],
        'episodes.*.audio_path' => ['nullable','string','url'],
    ];
}
}
