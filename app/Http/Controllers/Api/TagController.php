<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class TagController extends Controller
{
    #[OA\Get(
        path: '/api/tags',
        summary: 'Get list of tags',
        description: 'Retrieve a paginated list of tags.',
        tags: ['Tag'],
        parameters: [
            new OA\Parameter(
                name: 'per_page',
                in: 'query',
                schema: new OA\Schema(type: 'integer', example: 10)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of tags',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'name' => 'Horror',
                                'slug' => 'horror',
                                'created_at' => '2025-10-01T12:00:00Z',
                                'updated_at' => '2025-10-01T12:00:00Z',
                            ]
                        ],
                        'meta' => [
                            'current_page' => 1,
                            'per_page' => 10,
                            'total' => 1
                        ]
                    ]
                )
            )
        ]
    )]
    public function index()
    {
        $perPage = request()->query('per_page', 10);
        $tags = Tag::paginate($perPage);
        return TagResource::collection($tags);
    }

    #[OA\Get(
        path: '/api/tags/{tag}',
        summary: 'Get a single tag',
        description: 'Retrieve a tag by ID.',
        tags: ['Tag'],
        parameters: [
            new OA\Parameter(
                name: 'tag',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Tag retrieved successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'Tag retrieved successfully.',
                        'data' => [
                            'id' => 1,
                            'name' => 'Horror',
                            'slug' => 'horror',
                        ]
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Tag not found')
        ]
    )]
    public function show(Tag $tag)
    {
        return response()->json([
            'message' => 'Tag retrieved successfully.',
            'data' => new TagResource($tag),
        ]);
    }

    #[OA\Post(
        path: '/api/tags',
        summary: 'Create a tag',
        description: 'Create a new tag.',
        tags: ['Tag'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    required: ['name'],
                    properties: [
                        new OA\Property(property: 'name', type: 'string', example: 'Horror')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Tag created successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'Tag created successfully.',
                        'data' => [
                            'id' => 1,
                            'name' => 'Horror',
                            'slug' => 'horror',
                        ]
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error')
        ]
    )]
    public function store(CreateTagRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);
        $tag = Tag::create($data);

        return response()->json([
            'message' => 'Tag created successfully.',
            'data' => new TagResource($tag),
        ], 201);
    }

    #[OA\Put(
        path: '/api/tags/{tag}',
        summary: 'Update a tag',
        description: 'Update an existing tag.',
        tags: ['Tag'],
        parameters: [
            new OA\Parameter(
                name: 'tag',
                in: 'path',
                required: true,
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
                        new OA\Property(property: 'name', type: 'string', example: 'Updated Horror')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Tag updated successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'Tag updated successfully.',
                        'data' => [
                            'id' => 1,
                            'name' => 'Updated Horror',
                            'slug' => 'updated-horror',
                        ]
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Tag not found')
        ]
    )]
    public function update(UpdateTagRequest $request, Tag $tag)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);
        $tag->update($data);

        return response()->json([
            'message' => 'Tag updated successfully.',
            'data' => new TagResource($tag),
        ]);
    }

    #[OA\Delete(
        path: '/api/tags/{tag}',
        summary: 'Delete a tag',
        description: 'Delete a tag by ID.',
        tags: ['Tag'],
        parameters: [
            new OA\Parameter(
                name: 'tag',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Tag deleted successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'Tag deleted successfully.'
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Tag not found')
        ]
    )]
    public function destroy(Tag $tag)
    {
        $tag->delete();

        return response()->json([
            'message' => 'Tag deleted successfully.',
        ]);
    }
}
