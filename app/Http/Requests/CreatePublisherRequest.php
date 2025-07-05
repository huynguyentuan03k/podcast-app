<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePublisherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:publishers,email'],
            'website' => ['nullable', 'url', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'established_year' => ['required', 'integer', 'between:1800,' . now()->year],
        ];
    }
}
