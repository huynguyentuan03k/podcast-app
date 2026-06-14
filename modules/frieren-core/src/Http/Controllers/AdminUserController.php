<?php

namespace Frieren\Core\Http\Controllers;

use Frieren\Core\Actions\CreateAdminUserAction;
use Frieren\Core\Actions\DeleteAdminUserAction;
use Frieren\Core\Actions\GetAdminUserListAction;
use Frieren\Core\Actions\SyncAdminUserPermissionsAction;
use Frieren\Core\Actions\SyncAdminUserRolesAction;
use Frieren\Core\Actions\UpdateAdminUserAction;
use Frieren\Core\Http\Resources\AdminUserResource;
use Frieren\Core\Models\AdminUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Frieren\Core\Http\Requests\StoreAdminUserRequest;
use Frieren\Core\Http\Requests\SyncAdminUserPermissionsRequest;
use Frieren\Core\Http\Requests\SyncAdminUserRolesRequest;
use Frieren\Core\Http\Requests\UpdateAdminUserRequest;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

class AdminUserController extends Controller
{
    #[OA\Get(
        path: '/api/frieren-core/admin-users',
        description: 'Get a filtered list of admin users',
        tags: ['Frieren Core - Admin Users'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'username', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'email', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'status', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '-created_at')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of admin users',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'username' => 'root',
                                'email' => 'root@example.com',
                                'status' => 'active',
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
    public function index(GetAdminUserListAction $action)
    {
        Gate::authorize('admin-permission', 'VIEW_ADMIN_USER');

        return AdminUserResource::collection($action->handle((int) request('per_page', 10)));
    }

    #[OA\Post(
        path: '/api/frieren-core/admin-users',
        description: 'Create a new admin user',
        tags: ['Frieren Core - Admin Users'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['username', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'username', type: 'string', example: 'root'),
                    new OA\Property(property: 'email', type: 'string', example: 'root@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', example: 'password123'),
                    new OA\Property(property: 'status', type: 'string', example: 'active'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Admin user created successfully'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreAdminUserRequest $request, CreateAdminUserAction $action): JsonResponse
    {
        Gate::authorize('admin-permission', 'CREATE_ADMIN_USER');

        $user = $action->handle($request->validated());

        return response()->json([
            'message' => 'Admin user created successfully.',
            'data' => new AdminUserResource($user->load(['profile', 'roles', 'permissions'])),
        ], 201);
    }

    #[OA\Get(
        path: '/api/frieren-core/admin-users/{adminUser}',
        summary: 'Get a single admin user',
        description: 'Retrieve detailed information about a specific admin user by ID.',
        tags: ['Frieren Core - Admin Users'],
        parameters: [
            new OA\Parameter(
                name: 'adminUser',
                in: 'path',
                required: true,
                description: 'ID of the admin user to retrieve',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Admin user retrieved successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'Admin user retrieved successfully.',
                        'data' => [
                            'id' => 1,
                            'username' => 'root',
                            'email' => 'root@example.com',
                            'status' => 'active',
                            'created_at' => '2026-06-04 10:00:00',
                            'updated_at' => '2026-06-04 10:00:00',
                        ],
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Admin user not found'),
        ]
    )]
    public function show(AdminUser $adminUser): JsonResponse
    {
        abort_unless(
            Gate::allows('admin-permission', 'VIEW_ADMIN_USER')
                || Gate::allows('admin-permission', 'UPDATE_ADMIN_USER'),
            403
        );

        $adminUser->load(['profile', 'roles', 'permissions']);

        return response()->json([
            'message' => 'Admin user retrieved successfully.',
            'data' => new AdminUserResource($adminUser),
        ]);
    }

    #[OA\Put(
        path: '/api/frieren-core/admin-users/{adminUser}',
        summary: 'Update an admin user',
        tags: ['Frieren Core - Admin Users'],
        parameters: [
            new OA\Parameter(
                name: 'adminUser',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['username', 'email'],
                properties: [
                    new OA\Property(property: 'username', type: 'string', example: 'root-updated'),
                    new OA\Property(property: 'email', type: 'string', example: 'root-updated@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'newpassword123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', example: 'newpassword123'),
                    new OA\Property(property: 'status', type: 'string', example: 'suspended'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Admin user updated successfully'),
            new OA\Response(response: 404, description: 'Admin user not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateAdminUserRequest $request, AdminUser $adminUser, UpdateAdminUserAction $action): JsonResponse
    {
        Gate::authorize('admin-permission', 'UPDATE_ADMIN_USER');

        $adminUser = $action->handle($adminUser, $request->validated());

        return response()->json([
            'message' => 'Admin user updated successfully.',
            'data' => new AdminUserResource($adminUser),
        ]);
    }

    #[OA\Delete(
        path: '/api/frieren-core/admin-users/{adminUser}',
        summary: 'Delete an admin user',
        tags: ['Frieren Core - Admin Users'],
        parameters: [
            new OA\Parameter(
                name: 'adminUser',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Admin user deleted successfully'),
            new OA\Response(response: 404, description: 'Admin user not found'),
        ]
    )]
    public function destroy(AdminUser $adminUser, DeleteAdminUserAction $action): JsonResponse
    {
        Gate::authorize('admin-permission', 'DELETE_ADMIN_USER');

        $action->handle($adminUser);

        return response()->json(['message' => 'Admin user deleted successfully.']);
    }

    public function syncRoles(SyncAdminUserRolesRequest $request, AdminUser $adminUser, SyncAdminUserRolesAction $action): JsonResponse
    {
        abort_unless(
            Gate::allows('admin-permission', 'CREATE_ADMIN_USER')
                || Gate::allows('admin-permission', 'UPDATE_ADMIN_USER'),
            403
        );

        $action->handle($adminUser, $request->validated('role_ids'));

        return response()->json(['message' => 'Roles synced successfully.']);
    }

    public function syncPermissions(SyncAdminUserPermissionsRequest $request, AdminUser $adminUser, SyncAdminUserPermissionsAction $action): JsonResponse
    {
        abort_unless(
            Gate::allows('admin-permission', 'CREATE_ADMIN_USER')
                || Gate::allows('admin-permission', 'UPDATE_ADMIN_USER'),
            403
        );

        $action->handle($adminUser, $request->validated('permission_ids'));

        return response()->json(['message' => 'Permissions synced successfully.']);
    }
}
