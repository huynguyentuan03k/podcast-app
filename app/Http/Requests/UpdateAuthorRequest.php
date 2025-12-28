<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAuthorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['string'],
            'avatar' => ['file','mimes:jpg,jpeg,png,webpp','max:2048'],
            'email' => ['string','max:255'],
            'website' => ['string','max:255'],
        ];
    }
}
