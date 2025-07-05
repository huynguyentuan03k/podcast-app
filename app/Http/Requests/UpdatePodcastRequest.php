<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePodcastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('podcasts', 'title')->ignore($this->podcast?->id),
            ],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('podcasts', 'slug')->ignore($this->podcast?->id),
            ],
            'publisher_id' => ['required', 'integer', 'exists:publishers,id'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
