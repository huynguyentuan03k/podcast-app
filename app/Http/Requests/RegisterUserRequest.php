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
            'profile' => ['nullable', 'array'],
            'profile.display_name' => ['nullable', 'string', 'max:255'],
            'profile.phone_number' => ['nullable', 'string', 'max:255'],
            'profile.avatar' => ['nullable', 'string', 'max:2048'],
            'profile.date_of_birth' => ['nullable', 'date'],
            'profile.gender' => ['nullable', 'string', 'max:32'],
            'profile.bio' => ['nullable', 'string'],
            'profile.locale' => ['nullable', 'string', 'max:16'],
            'profile.timezone' => ['nullable', 'string', 'max:255'],
            'preference' => ['nullable', 'array'],
            'preference.language' => ['nullable', 'string', 'max:16'],
            'preference.theme' => ['nullable', 'string', 'max:32'],
            'preference.notification_enabled' => ['nullable', 'boolean'],
            'preference.email_notification_enabled' => ['nullable', 'boolean'],
            'preference.push_notification_enabled' => ['nullable', 'boolean'],
            'preference.autoplay_enabled' => ['nullable', 'boolean'],
            'preference.playback_speed' => ['nullable', 'numeric', 'min:0.25', 'max:3'],
        ];
    }
}
