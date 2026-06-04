<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AdminLoginApiRequest;
use Frieren\Core\Http\Requests\StoreAdminUserRequest;
use Frieren\Core\Models\AdminUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class AdminAuthController extends Controller
{
    #[OA\Post(
        path: '/api/admin/auth/login',
        description: 'Login for admin client',
        tags: ['Admin Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'admin@example.com'),
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
                        'client' => 'admin',
                        'user' => [
                            'id' => 1,
                            'username' => 'root',
                            'email' => 'admin@example.com',
                            'status' => 'active',
                        ],
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Invalid credentials'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function login(AdminLoginApiRequest $request): JsonResponse
    {
        $data = $request->validated();
        $admin = AdminUser::where('email', $data['email'])->first();

        if (! $admin || ! Hash::check($data['password'], $admin->password)) {
            return response()->json(['message' => 'login failed'], 401);
        }

        $token = $admin->createToken('admin-token', ['admin'])->plainTextToken;

        return response()->json([
            'message' => 'login successfully',
            'token' => $token,
            'client' => 'admin',
            'user' => $admin,
        ]);
    }

    #[OA\Post(
        path: '/api/admin/auth/register',
        description: 'Register admin and return token',
        tags: ['Admin Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['username', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'username', type: 'string', example: 'root'),
                    new OA\Property(property: 'email', type: 'string', example: 'admin@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', example: 'password123'),
                    new OA\Property(property: 'status', type: 'string', example: 'active'),
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
                        'client' => 'admin',
                        'user' => [
                            'id' => 1,
                            'username' => 'root',
                            'email' => 'admin@example.com',
                            'status' => 'active',
                        ],
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function register(StoreAdminUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $admin = DB::transaction(function () use ($data) {
            $data['password'] = Hash::make($data['password']);
            $data['status'] = $data['status'] ?? 'active';

            return AdminUser::create($data);
        });

        $token = $admin->createToken('admin-token', ['admin'])->plainTextToken;

        return response()->json([
            'message' => 'register successfully',
            'token' => $token,
            'client' => 'admin',
            'user' => $admin,
        ], 201);
    }

    #[OA\Post(
        path: '/api/admin/auth/logout',
        description: 'Logout authenticated admin',
        tags: ['Admin Auth'],
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
