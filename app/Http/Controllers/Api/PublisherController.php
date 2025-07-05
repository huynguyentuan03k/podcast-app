<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreatePublisherAction;
use App\Actions\GetPublisherListAction;
use App\Actions\UpdatePublisherAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreatePublisherRequest;
use App\Http\Requests\UpdatePublisherRequest;
use App\Http\Resources\PublisherResource;
use App\Models\Publisher;
use OpenApi\Attributes as OA;
use PDO;

class PublisherController extends Controller
{
    #[OA\Post(
        path: '/api/publishers',
        description: 'Create a new publisher',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    required: ['name'],
                    properties: [
                        new OA\Property(property: 'name', type: 'string', example: 'OpenAI'),
                        new OA\Property(property: 'address', type: 'string', example: 'San Francisco'),
                        new OA\Property(property: 'email', type: 'string', example: 'info@openai.com'),
                        new OA\Property(property: 'website', type: 'string', example: 'https://openai.com'),
                        new OA\Property(property: 'phone', type: 'string', example: '123456789'),
                        new OA\Property(property: 'established_year', type: 'integer', example: 2015),
                    ]
                )
            )
        ),
        tags: ['Publisher'],
        responses: [
            new OA\Response(response: 201, description: 'Publisher created')
        ]
    )]
    public function store(CreatePublisherRequest $request, CreatePublisherAction $action)
    {
        $record = $action->handle($request->validated());
        return response()->json([
            'message' => 'Publisher created successfully.',
            'data' => $record,
        ], 201);
    }

    #[OA\Get(
        path: '/api/publishers',
        description: 'Get a filtered list of publishers',
        tags: ['Publisher'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'slug', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'description', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'all', in: 'query', description: 'Search all fields', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '-created_at')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'fields[publishers]', in: 'query', schema: new OA\Schema(type: 'string', example: 'id,name')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of publishers',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'name' => 'Example Publisher',
                                'slug' => 'example-publisher',
                                'description' => 'A publisher of great content',
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
    public function index(GetPublisherListAction $action)
    {
        $perPage = request()->query('per_page');
        $publisher = $action->handle($perPage);
        return PublisherResource::collection($publisher);
    }

    #[OA\Put(
        path: '/api/publishers/{publisher}',
        summary: 'Update a publisher',
        description: 'Update the information of an existing publisher by ID.',
        tags: ['Publisher'],
        parameters: [
            new OA\Parameter(
                name: 'publisher',
                in: 'path',
                required: true,
                description: 'ID of the publisher to update',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    required: ['name'],
                    properties: [
                        new OA\Property(property: 'name', type: 'string', example: 'Updated Publisher Name'),
                        new OA\Property(property: 'address', type: 'string', example: '123 Main St, City'),
                        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'contact@example.com'),
                        new OA\Property(property: 'phone', type: 'string', example: '+123456789'),
                        new OA\Property(property: 'website', type: 'string', format: 'url', example: 'https://publisher.example.com'),
                        new OA\Property(property: 'established_year', type: 'integer', example: 1999),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Publisher updated successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'publisher updated successfully.',
                        'data' => [
                            'id' => 1,
                            'name' => 'Updated Publisher Name',
                            'address' => '123 Main St, City',
                            'email' => 'contact@example.com',
                            'phone' => '+123456789',
                            'website' => 'https://publisher.example.com',
                            'established_year' => 1999,
                            'created_at' => '2025-07-01T12:00:00.000000Z',
                            'updated_at' => '2025-07-02T14:00:00.000000Z',
                        ]
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error',
            ),
            new OA\Response(
                response: 404,
                description: 'Publisher not found'
            )
        ]
    )]
    public function update(UpdatePublisherRequest $request, Publisher $publisher, UpdatePublisherAction $action)
    {
        $data = $request->validated();

        $updated = $action->handle($publisher, $data);

        return response()->json([
            'message' => 'publisher updated successfully.',
            'data' => $updated,
        ], 200);
    }
}
