<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePodcastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255','unique:podcasts,title' . $this->podcast?->title],
            'slug' => ['required', 'string', 'max:255', 'unique:podcasts,slug' . $this->podcast?->id],
            'publisher_id' => ['required', 'integer', 'exists:publishers,id'],
            'description' => ['nullable', 'string'],
            // just accept file, must image, limit format jpg,jpeg,png,webp, limit storage
            'cover_image' => ['nullable','file','image','mines:jpg,jpeg,png,webp','max:2048'],
        ];
    }
}

