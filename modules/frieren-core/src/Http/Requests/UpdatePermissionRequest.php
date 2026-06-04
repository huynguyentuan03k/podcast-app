<?php

namespace Frieren\Core\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $permissionId = $this->route('permission')?->id ?? $this->route('permission');

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('permissions', 'name')->ignore($permissionId)],
            'display_name' => ['sometimes', 'string', 'max:255'],
            'group_name' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
