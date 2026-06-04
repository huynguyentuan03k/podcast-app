<?php

namespace Frieren\Core\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $adminUserId = $this->route('adminUser')?->id ?? $this->route('adminUser');

        return [
            'username' => ['sometimes', 'string', 'max:255', Rule::unique('users_admin', 'username')->ignore($adminUserId)],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users_admin', 'email')->ignore($adminUserId)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'status' => ['sometimes', 'in:active,suspended'],
        ];
    }
}
