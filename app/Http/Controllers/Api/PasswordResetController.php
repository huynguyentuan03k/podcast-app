<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ForgotPasswordRequest;
use App\Http\Requests\Api\ResetPasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class PasswordResetController extends Controller
{
    #[OA\Post(
        path: '/api/auth/forgot-password',
        description: 'Send password reset link for web/mobile client',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Reset link sent'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        Password::broker('users')->sendResetLink($request->validated());

        return response()->json([
            'message' => __('Password reset link sent successfully.'),
        ]);
    }

    #[OA\Post(
        path: '/api/auth/reset-password',
        description: 'Reset password for web/mobile client',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['token', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'token', type: 'string', example: 'reset-token'),
                    new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', example: 'password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Password reset successfully'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::broker('users')->reset(
            $request->validated(),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __('Password reset successfully.'),
            ]);
        }

        return response()->json([
            'message' => __($status),
        ], 422);
    }
}
