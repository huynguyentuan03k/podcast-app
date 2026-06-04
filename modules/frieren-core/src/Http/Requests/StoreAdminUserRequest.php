<?php

namespace Frieren\Core\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:255', 'unique:users_admin,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users_admin,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'status' => ['nullable', 'in:active,suspended'],
        ];
    }
}
