<?php

namespace App\Http\Controllers\Api;

use App\Actions\GetUserListAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    #[OA\Get(
        path: '/api/users',
        description: 'Get a filtered list of users',
        tags: ['User'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'email', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '-created_at')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of users',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'name' => 'Example User',
                                'email' => 'user@example.com',
                                'email_verified_at' => null,
                                'created_at' => '2026-02-06 02:22:00',
                                'updated_at' => '2026-02-06 02:22:00',
                            ],
                        ],
                        'meta' => [
                            'current_page' => 1,
                            'per_page' => 10,
                            'total' => 1,
                        ],
                    ]
                )
            )
        ]
    )]
    public function index(GetUserListAction $action)
    {
        $perPage = request()->query('per_page');
        $users = $action->handle($perPage);

        return UserResource::collection($users);
    }

    #[OA\Get(
        path: '/api/users/{user}',
        summary: 'Get a single user',
        description: 'Retrieve detailed information about a specific user by ID.',
        tags: ['User'],
        parameters: [
            new OA\Parameter(
                name: 'user',
                in: 'path',
                required: true,
                description: 'ID of the user to retrieve',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'User retrieved successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'User retrieved successfully',
                        'data' => [
                            'id' => 1,
                            'name' => 'Example User',
                            'email' => 'user@example.com',
                            'email_verified_at' => null,
                            'created_at' => '2026-02-06 02:22:00',
                            'updated_at' => '2026-02-06 02:22:00',
                        ],
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function show(User $user)
    {
        return response()->json([
            'message' => 'User retrieved successfully',
            'data' => new UserResource($user),
        ]);
    }

    #[OA\Post(
        path: '/api/users',
        description: 'Create a new user',
        tags: ['User'],
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
                description: 'User created successfully'
            ),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(RegisterUserRequest $request)
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            $data['password'] = Hash::make($data['password']);

            return User::create($data);
        });

        return response()->json([
            'message' => 'User created successfully.',
            'data' => new UserResource($user),
        ], 201);
    }

    #[OA\Put(
        path: '/api/users/{user}',
        summary: 'Update a user',
        tags: ['User'],
        parameters: [
            new OA\Parameter(
                name: 'user',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Updated User'),
                    new OA\Property(property: 'email', type: 'string', example: 'updated@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'newpassword123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', example: 'newpassword123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'User updated successfully'),
            new OA\Response(response: 404, description: 'User not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (array_key_exists('password', $data) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => new UserResource($user->fresh()),
        ]);
    }

    #[OA\Delete(
        path: '/api/users/{user}',
        summary: 'Delete a user',
        tags: ['User'],
        parameters: [
            new OA\Parameter(
                name: 'user',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'User deleted successfully'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}
