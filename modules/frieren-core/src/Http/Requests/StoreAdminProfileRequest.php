<?php

namespace Frieren\Core\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdminProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_admin_id' => ['required', 'integer', 'exists:users_admin,id', 'unique:admin_profiles,user_admin_id'],
            'employee_code' => ['nullable', 'string', 'max:255', 'unique:admin_profiles,employee_code'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
