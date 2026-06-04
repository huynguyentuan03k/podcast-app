<?php

namespace Frieren\Core\Http\Controllers;

use Frieren\Core\Actions\CreateRoleAction;
use Frieren\Core\Actions\DeleteRoleAction;
use Frieren\Core\Actions\GetRoleListAction;
use Frieren\Core\Actions\SyncRolePermissionsAction;
use Frieren\Core\Actions\UpdateRoleAction;
use Frieren\Core\Http\Requests\StoreRoleRequest;
use Frieren\Core\Http\Requests\SyncRolePermissionsRequest;
use Frieren\Core\Http\Requests\UpdateRoleRequest;
use Frieren\Core\Http\Resources\RoleResource;
use Frieren\Core\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use OpenApi\Attributes as OA;

class RoleController extends Controller
{
    #[OA\Get(
        path: '/api/frieren-core/roles',
        description: 'Get a filtered list of roles',
        tags: ['Frieren Core - Roles'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'display_name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '-created_at')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of roles',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'name' => 'super-admin',
                                'display_name' => 'Super Admin',
                                'description' => 'All access',
                                'created_at' => '2026-06-04 10:00:00',
                                'updated_at' => '2026-06-04 10:00:00',
                            ],
                        ],
                        'meta' => [
                            'current_page' => 1,
                            'per_page' => 10,
                            'total' => 1,
                        ],
                    ]
                )
            ),
        ]
    )]
    public function index(GetRoleListAction $action)
    {
        return RoleResource::collection($action->handle((int) request('per_page', 10)));
    }

    #[OA\Post(
        path: '/api/frieren-core/roles',
        description: 'Create a new role',
        tags: ['Frieren Core - Roles'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'display_name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'super-admin'),
                    new OA\Property(property: 'display_name', type: 'string', example: 'Super Admin'),
                    new OA\Property(property: 'description', type: 'string', example: 'All access'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Role created successfully'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreRoleRequest $request, CreateRoleAction $action): JsonResponse
    {
        $role = $action->handle($request->validated());

        return response()->json(['message' => 'Role created successfully.', 'data' => new RoleResource($role)], 201);
    }

    #[OA\Get(
        path: '/api/frieren-core/roles/{role}',
        summary: 'Get a single role',
        tags: ['Frieren Core - Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Role retrieved successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'Role retrieved successfully.',
                        'data' => [
                            'id' => 1,
                            'name' => 'super-admin',
                            'display_name' => 'Super Admin',
                            'description' => 'All access',
                            'created_at' => '2026-06-04 10:00:00',
                            'updated_at' => '2026-06-04 10:00:00',
                        ],
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Role not found'),
        ]
    )]
    public function show(Role $role): JsonResponse
    {
        $role->load('permissions');

        return response()->json(['message' => 'Role retrieved successfully.', 'data' => new RoleResource($role)]);
    }

    #[OA\Put(
        path: '/api/frieren-core/roles/{role}',
        summary: 'Update a role',
        tags: ['Frieren Core - Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'editor'),
                    new OA\Property(property: 'display_name', type: 'string', example: 'Editor'),
                    new OA\Property(property: 'description', type: 'string', example: 'Can edit content'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Role updated successfully'),
            new OA\Response(response: 404, description: 'Role not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateRoleRequest $request, Role $role, UpdateRoleAction $action): JsonResponse
    {
        $role = $action->handle($role, $request->validated());

        return response()->json(['message' => 'Role updated successfully.', 'data' => new RoleResource($role)]);
    }

    #[OA\Delete(
        path: '/api/frieren-core/roles/{role}',
        summary: 'Delete a role',
        tags: ['Frieren Core - Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Role deleted successfully'),
            new OA\Response(response: 404, description: 'Role not found'),
        ]
    )]
    public function destroy(Role $role, DeleteRoleAction $action): JsonResponse
    {
        $action->handle($role);
        return response()->json(['message' => 'Role deleted successfully.']);
    }

    #[OA\Post(
        path: '/api/frieren-core/roles/{role}/permissions',
        description: 'Sync permissions to a role',
        tags: ['Frieren Core - Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['permission_ids'],
                properties: [
                    new OA\Property(
                        property: 'permission_ids',
                        type: 'array',
                        items: new OA\Items(type: 'integer'),
                        example: [1, 2]
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Role permissions synced successfully'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function syncPermissions(SyncRolePermissionsRequest $request, Role $role, SyncRolePermissionsAction $action): JsonResponse
    {
        $action->handle($role, $request->validated('permission_ids'));

        return response()->json(['message' => 'Role permissions synced successfully.']);
    }
}
