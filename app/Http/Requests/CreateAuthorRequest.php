<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class CreateAuthorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable','string','max:255'],
            'website' => ['nullable','string','max:255'],
            'avatar' => ['nullable','file' ],
            'email' => ['nullable','string','max:255'],
        ];
    }
}
