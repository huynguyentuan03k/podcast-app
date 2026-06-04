<?php

namespace Frieren\Core\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $adminProfileId = $this->route('adminProfile')?->id ?? $this->route('adminProfile');

        return [
            'user_admin_id' => ['sometimes', 'integer', 'exists:users_admin,id', Rule::unique('admin_profiles', 'user_admin_id')->ignore($adminProfileId)],
            'employee_code' => ['nullable', 'string', 'max:255', Rule::unique('admin_profiles', 'employee_code')->ignore($adminProfileId)],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
