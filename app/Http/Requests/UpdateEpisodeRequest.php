<?php

namespace App\Http\Requests;

use App\Models\Episode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEpisodeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         return [
        'title' => ['required', 'string'],
        'description' => ['nullable', 'string'],
        'audio_path' => [
        'nullable','string','url',
        'file' => ['nullable','mimes:mp3,wav,mpeg','max:122880']
        ],
        'slug' => ['required', 'string'],
        'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        'podcast_id' => ['required', 'integer', 'exists:podcasts,id'],
    ];
    }
}
