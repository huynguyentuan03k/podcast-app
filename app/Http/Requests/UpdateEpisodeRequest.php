<?php

namespace App\Http\Requests;

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
        $episodeId = $this->route('episode')?->id ?? $this->route('episode');

        return [
            'title' => ['required', 'string', Rule::unique('episodes', 'title')->ignore($episodeId)],
            'description' => ['nullable', 'string'],
            'audio_path' => ['required', 'url', 'max:2048'],
            'duration' => ['nullable', 'string'],
            'slug' => ['required', 'string'],
            'cover_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'podcast_id' => ['required', 'integer', 'exists:podcasts,id'],
        ];
    }
}
