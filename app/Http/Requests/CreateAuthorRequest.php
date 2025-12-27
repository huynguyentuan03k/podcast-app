<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'bio' => ['string','max:255'],
            'website' => ['string','max:255'],
            'avatar' => ['max:1024'],
            'email' => ['string','max:255'],
        ];
    }
}
