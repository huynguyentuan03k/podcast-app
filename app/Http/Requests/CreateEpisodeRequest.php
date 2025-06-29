<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateEpisodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'unique:episodes,title'],
            'description' => ['nullable', 'string'],
            'audio_path' => ['nullable', 'file', 'mimes:mp3,wav,mpeg'],
            'duration' => ['nullable', 'integer'],
            'slug' => ['required', 'string'],
            'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp'],
            'podcast_id' => ['required','integer'],
        ];
    }
}
