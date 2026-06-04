<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginApiRequest;
use App\Http\Requests\Api\RegisterApiRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

// full api sanctum
class AuthController extends Controller
{
    #[OA\Post(
        path: '/api/auth/login',
        description: 'Login for web/mobile clients',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'login successfully',
                        'token' => '1|plain-text-token',
                        'client' => 'web-mobile',
                        'user' => [
                            'id' => 1,
                            'name' => 'Example User',
                            'email' => 'user@example.com',
                        ],
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Invalid credentials'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function login(LoginApiRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'login failed'], 401);
        }

        $token = $user->createToken('web-mobile-token', ['user'])->plainTextToken;

        return response()->json([
            'message' => 'login successfully',
            "token" => $token,
            'client' => 'web-mobile',
            'user' => $user,
        ]);
    }

    #[OA\Post(
        path: '/api/auth/register',
        description: 'Register and return token for web/mobile clients',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Example User'),
                    new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', example: 'password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Register successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'register successfully',
                        'token' => '1|plain-text-token',
                        'client' => 'web-mobile',
                        'user' => [
                            'id' => 1,
                            'name' => 'Example User',
                            'email' => 'user@example.com',
                        ],
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function register(RegisterApiRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            $data['password'] = Hash::make($data['password']);

            return User::create($data);
        });

        $token = $user->createToken('web-mobile-token', ['user'])->plainTextToken;

        return response()->json([
            'message' => 'register successfully',
            'token' => $token,
            'client' => 'web-mobile',
            'user' => $user,
        ], 201);
    }

    #[OA\Get(
        path: '/api/auth/me',
        description: 'Get current authenticated web/mobile user',
        tags: ['Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Current user retrieved successfully',
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function me(): JsonResponse
    {
        return response()->json([
            'message' => 'Current user retrieved successfully.',
            'data' => request()->user(),
        ]);
    }

    #[OA\Post(
        path: '/api/auth/logout',
        description: 'Logout authenticated web/mobile user',
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Logout successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function logout(): JsonResponse
    {
        request()->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'logout successfully']);
    }
}
