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
        'title' => ['required','string','unique:episodes,title'],
        'description' => ['nullable','string'],
        'audio_file' => ['nullable'],
        'duration' => ['integer','nullable'],
        'slug' => ['required','string'],
        'cover_image' => ['nullable','string'],
        ];
    }
}