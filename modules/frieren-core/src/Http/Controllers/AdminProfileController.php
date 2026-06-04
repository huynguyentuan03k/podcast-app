<?php

namespace Frieren\Core\Http\Controllers;

use Frieren\Core\Actions\CreateAdminProfileAction;
use Frieren\Core\Actions\DeleteAdminProfileAction;
use Frieren\Core\Actions\GetAdminProfileListAction;
use Frieren\Core\Actions\UpdateAdminProfileAction;
use Frieren\Core\Http\Requests\StoreAdminProfileRequest;
use Frieren\Core\Http\Requests\UpdateAdminProfileRequest;
use Frieren\Core\Http\Resources\AdminProfileResource;
use Frieren\Core\Models\AdminProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use OpenApi\Attributes as OA;

class AdminProfileController extends Controller
{
    #[OA\Get(
        path: '/api/frieren-core/admin-profiles',
        description: 'Get a filtered list of admin profiles',
        tags: ['Frieren Core - Admin Profiles'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'user_admin_id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'employee_code', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'department', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '-created_at')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of admin profiles',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'user_admin_id' => 1,
                                'employee_code' => 'EMP001',
                                'first_name' => 'Frieren',
                                'last_name' => 'Core',
                                'department' => 'IT',
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
    public function index(GetAdminProfileListAction $action)
    {
        return AdminProfileResource::collection($action->handle((int) request('per_page', 10)));
    }

    #[OA\Post(
        path: '/api/frieren-core/admin-profiles',
        description: 'Create a new admin profile',
        tags: ['Frieren Core - Admin Profiles'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['user_admin_id', 'first_name', 'last_name'],
                properties: [
                    new OA\Property(property: 'user_admin_id', type: 'integer', example: 1),
                    new OA\Property(property: 'employee_code', type: 'string', example: 'EMP001'),
                    new OA\Property(property: 'first_name', type: 'string', example: 'Frieren'),
                    new OA\Property(property: 'last_name', type: 'string', example: 'Core'),
                    new OA\Property(property: 'phone_number', type: 'string', example: '0900000000'),
                    new OA\Property(property: 'avatar', type: 'string', example: 'https://example.com/avatar.png'),
                    new OA\Property(property: 'department', type: 'string', example: 'IT'),
                    new OA\Property(
                        property: 'metadata',
                        type: 'object',
                        example: ['level' => 'senior']
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Admin profile created successfully'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreAdminProfileRequest $request, CreateAdminProfileAction $action): JsonResponse
    {
        $profile = $action->handle($request->validated());

        return response()->json(['message' => 'Admin profile created successfully.', 'data' => new AdminProfileResource($profile)], 201);
    }

    #[OA\Get(
        path: '/api/frieren-core/admin-profiles/{adminProfile}',
        summary: 'Get a single admin profile',
        tags: ['Frieren Core - Admin Profiles'],
        parameters: [
            new OA\Parameter(
                name: 'adminProfile',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Admin profile retrieved successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'Admin profile retrieved successfully.',
                        'data' => [
                            'id' => 1,
                            'user_admin_id' => 1,
                            'employee_code' => 'EMP001',
                            'first_name' => 'Frieren',
                            'last_name' => 'Core',
                            'department' => 'IT',
                            'created_at' => '2026-06-04 10:00:00',
                            'updated_at' => '2026-06-04 10:00:00',
                        ],
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Admin profile not found'),
        ]
    )]
    public function show(AdminProfile $adminProfile): JsonResponse
    {
        return response()->json(['message' => 'Admin profile retrieved successfully.', 'data' => new AdminProfileResource($adminProfile)]);
    }

    #[OA\Put(
        path: '/api/frieren-core/admin-profiles/{adminProfile}',
        summary: 'Update an admin profile',
        tags: ['Frieren Core - Admin Profiles'],
        parameters: [
            new OA\Parameter(
                name: 'adminProfile',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'user_admin_id', type: 'integer', example: 1),
                    new OA\Property(property: 'employee_code', type: 'string', example: 'EMP002'),
                    new OA\Property(property: 'first_name', type: 'string', example: 'Updated'),
                    new OA\Property(property: 'last_name', type: 'string', example: 'Name'),
                    new OA\Property(property: 'phone_number', type: 'string', example: '0900000001'),
                    new OA\Property(property: 'avatar', type: 'string', example: 'https://example.com/avatar-2.png'),
                    new OA\Property(property: 'department', type: 'string', example: 'HR'),
                    new OA\Property(property: 'metadata', type: 'object', example: ['level' => 'lead']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Admin profile updated successfully'),
            new OA\Response(response: 404, description: 'Admin profile not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateAdminProfileRequest $request, AdminProfile $adminProfile, UpdateAdminProfileAction $action): JsonResponse
    {
        $adminProfile = $action->handle($adminProfile, $request->validated());

        return response()->json(['message' => 'Admin profile updated successfully.', 'data' => new AdminProfileResource($adminProfile->fresh())]);
    }

    #[OA\Delete(
        path: '/api/frieren-core/admin-profiles/{adminProfile}',
        summary: 'Delete an admin profile',
        tags: ['Frieren Core - Admin Profiles'],
        parameters: [
            new OA\Parameter(
                name: 'adminProfile',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Admin profile deleted successfully'),
            new OA\Response(response: 404, description: 'Admin profile not found'),
        ]
    )]
    public function destroy(AdminProfile $adminProfile, DeleteAdminProfileAction $action): JsonResponse
    {
        $action->handle($adminProfile);
        return response()->json(['message' => 'Admin profile deleted successfully.']);
    }
}
