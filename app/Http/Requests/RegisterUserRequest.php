<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required','email','unique:users,email'],
            // nếu ghi như này confirmed tức là fe gửi lên
//             {
//                  "password": "12345678",
//                  "password_confirmation": "12345678"
//              }
            'password' => ['required','string','min:8','confirmed'],
        ];
    }
}
