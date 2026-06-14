<?php

namespace Frieren\Core\Http\Controllers;

use Frieren\Core\Actions\CreatePermissionAction;
use Frieren\Core\Actions\DeletePermissionAction;
use Frieren\Core\Actions\GetPermissionListAction;
use Frieren\Core\Actions\UpdatePermissionAction;
use Frieren\Core\Http\Requests\StorePermissionRequest;
use Frieren\Core\Http\Requests\UpdatePermissionRequest;
use Frieren\Core\Http\Resources\PermissionResource;
use Frieren\Core\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

class PermissionController extends Controller
{
    #[OA\Get(
        path: '/api/frieren-core/permissions',
        description: 'Get a filtered list of permissions',
        tags: ['Frieren Core - Permissions'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'display_name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'group_name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '-created_at')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of permissions',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'name' => 'podcasts.create',
                                'display_name' => 'Create Podcast',
                                'group_name' => 'Podcast',
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
    public function index(GetPermissionListAction $action)
    {
        abort_unless(
            Gate::allows('admin-permission', 'VIEW_ROLE')
                || Gate::allows('admin-permission', 'CREATE_ROLE')
                || Gate::allows('admin-permission', 'UPDATE_ROLE'),
            403
        );

        return PermissionResource::collection($action->handle((int) request('per_page', 10)));
    }

    #[OA\Post(
        path: '/api/frieren-core/permissions',
        description: 'Create a new permission',
        tags: ['Frieren Core - Permissions'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'display_name', 'group_name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'podcasts.create'),
                    new OA\Property(property: 'display_name', type: 'string', example: 'Create Podcast'),
                    new OA\Property(property: 'group_name', type: 'string', example: 'Podcast'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Permission created successfully'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StorePermissionRequest $request, CreatePermissionAction $action): JsonResponse
    {
        Gate::authorize('admin-permission', 'CREATE_PERMISSION');

        $permission = $action->handle($request->validated());

        return response()->json(['message' => 'Permission created successfully.', 'data' => new PermissionResource($permission)], 201);
    }

    #[OA\Get(
        path: '/api/frieren-core/permissions/{permission}',
        summary: 'Get a single permission',
        tags: ['Frieren Core - Permissions'],
        parameters: [
            new OA\Parameter(
                name: 'permission',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Permission retrieved successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'Permission retrieved successfully.',
                        'data' => [
                            'id' => 1,
                            'name' => 'podcasts.create',
                            'display_name' => 'Create Podcast',
                            'group_name' => 'Podcast',
                            'created_at' => '2026-06-04 10:00:00',
                            'updated_at' => '2026-06-04 10:00:00',
                        ],
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Permission not found'),
        ]
    )]
    public function show(Permission $permission): JsonResponse
    {
        Gate::authorize('admin-permission', 'VIEW_PERMISSION');

        return response()->json(['message' => 'Permission retrieved successfully.', 'data' => new PermissionResource($permission)]);
    }

    #[OA\Put(
        path: '/api/frieren-core/permissions/{permission}',
        summary: 'Update a permission',
        tags: ['Frieren Core - Permissions'],
        parameters: [
            new OA\Parameter(
                name: 'permission',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'podcasts.update'),
                    new OA\Property(property: 'display_name', type: 'string', example: 'Update Podcast'),
                    new OA\Property(property: 'group_name', type: 'string', example: 'Podcast'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Permission updated successfully'),
            new OA\Response(response: 404, description: 'Permission not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdatePermissionRequest $request, Permission $permission, UpdatePermissionAction $action): JsonResponse
    {
        Gate::authorize('admin-permission', 'UPDATE_PERMISSION');

        $permission = $action->handle($permission, $request->validated());

        return response()->json(['message' => 'Permission updated successfully.', 'data' => new PermissionResource($permission)]);
    }

    #[OA\Delete(
        path: '/api/frieren-core/permissions/{permission}',
        summary: 'Delete a permission',
        tags: ['Frieren Core - Permissions'],
        parameters: [
            new OA\Parameter(
                name: 'permission',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Permission deleted successfully'),
            new OA\Response(response: 404, description: 'Permission not found'),
        ]
    )]
    public function destroy(Permission $permission, DeletePermissionAction $action): JsonResponse
    {
        Gate::authorize('admin-permission', 'DELETE_PERMISSION');

        $action->handle($permission);
        return response()->json(['message' => 'Permission deleted successfully.']);
    }
}
