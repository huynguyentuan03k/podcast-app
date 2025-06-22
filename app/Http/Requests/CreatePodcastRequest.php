<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePodcastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255','unique:podcasts,title'],
            'slug' => ['required', 'string', 'max:255','unique:podcasts,slug'],
            'description' => ['nullable', 'string'],
            'publisher_id' => ['required', 'integer', 'exists:publishers,id'],
            'cover_image' => 'nullable|image|max:2048', 
        ];
    }
}
