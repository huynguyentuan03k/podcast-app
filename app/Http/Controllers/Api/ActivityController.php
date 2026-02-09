<?php

namespace App\Http\Controllers\Api;

use App\Actions\GetActivityListAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use Spatie\Activitylog\Models\Activity;
use OpenApi\Attributes as OA;


class ActivityController extends Controller
{

   #[OA\Get(
        path: '/api/activities',
        description: 'Get a filtered list of activities',
        tags: ['Activity'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of activities',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'event' => 'Example category',
                                'log_name' => 'example-category',
                                'properties' => 'A category of great content',
                                'created_at' => '2025-07-01T12:00:00Z',
                                'updated_at' => '2025-07-01T12:00:00Z',
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
    public function index(GetActivityListAction $action)
    {
        $perPage = request()->query('per_page');
        $activity = $action->handle($perPage);

        return ActivityResource::collection($activity);
    }


    #[OA\Get(
        path: '/api/activities/{activity}',
        summary: 'Get a single activity',
        description: 'Retrieve detailed information about a specific activity by ID.',
        tags: ['Activity'],
        parameters: [
            new OA\Parameter(
                name: 'activity',
                in: 'path',
                required: true,
                description: 'ID of the activity to retrieve',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Activity retrieved successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'activity show successfully',
                        'data' => [
                            'id' => 1,
                            'name' => 'Example Activity',
                            'description' => '123 Main St, City',
                        ]
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: 'Activity not found'
            )
        ]
    )]
    public function show(Activity $activity)
    {

        return response()->json([
            'message' => 'activity show successfully',
            'data' => new ActivityResource($activity)
        ]);
    }

}
