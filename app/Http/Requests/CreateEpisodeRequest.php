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
            'audio_path' => ['nullable', 'file', 'mimes:mp3,wav,mpeg', 'max:122880'],
            'duration' => ['nullable', 'string'],
            'slug' => ['required', 'string'],
            'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'podcast_id' => ['required', 'integer', 'exists:podcasts,id'],
            'episodes' => ['nullable', 'array'],
            'episodes.*.title' => ['required', 'string', 'max:255'],
            'episodes.*.slug' => ['required', 'string', 'max:255'],
            'episodes.*.podcast_id' => ['required', 'integer', 'exists:podcasts,id'],
            'episodes.*.audio_path' => ['nullable', 'file', 'mimes:mp3,wav,mpeg', 'max:122880'],
        ];
    }
}
