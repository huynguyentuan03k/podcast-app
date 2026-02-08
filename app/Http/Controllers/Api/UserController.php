<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreateAuthorAction;
use App\Actions\DeleteAuthorAction;
use App\Actions\GetAuthorListAction;
use App\Actions\GetUserListAction;
use App\Actions\UpdateAuthorAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateAuthorRequest;
use App\Http\Requests\UpdateAuthorRequest;
use App\Http\Resources\AuthorResource;
use App\Http\Resources\UserResource;
use App\Models\Author;
use App\Models\User;
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
            new OA\Parameter(name: 'slug', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'description', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'all', in: 'query', description: 'Search all fields', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', example: 1)),
            new OA\Parameter(name: 'fields[users]', in: 'query', schema: new OA\Schema(type: 'string', example: '')),
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
                            'email_verified_at'=> 'null',
                            'email'=> 'tuanhuy16903@gmail.com',
                            'created_at'=> '2026-02-06 02:22:00',
                            'updated_at'=> '2026-02-06 02:22:00',
                            ]
                        ],
                        'meta' => [
                            'current_page' => 1,
                            'per_page' => 10,
                            'total' => 1,
                        ]
                    ]
                )
            )
        ]
    )]
    public function index(GetUserListAction $action)
    {
        $perPage = request()->query('per_page');
        $user = $action->handle($perPage);
        return UserResource::collection($user);
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
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'User retrieved successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'user show successfully',
                        'data' => [
                            'id' => 1,
                            'name' => 'Example User',
                            'email_verified_at'=> 'null',
                            'email'=> 'tuanhuy16903@gmail.com',
                            'created_at'=> '2026-02-06 02:22:00',
                            'updated_at'=> '2026-02-06 02:22:00',
                        ]
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: 'User not found'
            )
        ]
    )]
    public function show(User $user){
        return response()->json([
            'message' => 'user show successfully',
            'data' => new UserResource($user)
        ]);
    }


        #[OA\Post(
        path: '/api/users',
        description: 'Create a new user',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['name'],
                    properties: [
                        new OA\Property(property: 'name', type: 'string', example: 'j.k.rowling'),
                        new OA\Property(property: 'description', type: 'string', example: 'j.k.rowling'),
                        new OA\Property(property: 'bio', type: 'string', example: 'about j.k.rowling'),
                        new OA\Property(property: 'website', type: 'string', example: 'website.com'),
                        new OA\Property(property: 'email', type: 'string', example: 'email.com'),
                        new OA\property(property: 'avatar', type: 'string', format: 'binary', description: 'Cover image to upload (.jpg, .png'),
                    ]
                )
            )
        ),
        tags: ['User'],
        responses: [
            new OA\Response(response: 201, description: 'user created')
        ]
        )]
    public function store(CreateAuthorRequest $request, CreateAuthorAction $action)
    {
        $record = $action->handle($request->validated());

        return response()->json([
            'message' => 'Author created successfully.',
            'data' => $record,
        ], 201);
    }

}
