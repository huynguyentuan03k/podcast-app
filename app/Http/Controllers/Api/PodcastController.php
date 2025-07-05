<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreatePodcastAction;
use App\Actions\DeletePodcastAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePodcastRequest;
use App\Http\Requests\UpdatePodcastRequest;
use App\Http\Resources\PodcastResource;
use App\Models\Podcast;
use App\Actions\GetPodcastListAction;
use App\Actions\UpdatePodcastAction;
use App\Http\Requests\CreatePodcastRequest;
use OpenApi\Attributes as OA;


class PodcastController extends Controller
{
    #[OA\Get(
        path: '/api/podcasts',
        description: 'Get a filtered list of podcasts',
        tags: ['Podcast'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'title', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'slug', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'description', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'publisher_id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'all', in: 'query', description: 'Search all fields', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '-created_at')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'fields[podcasts]', in: 'query', schema: new OA\Schema(type: 'string', example: 'id,title')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of podcasts',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'title' => 'Sample Podcast',
                                'slug' => 'sample-podcast',
                                'description' => 'This is a podcast',
                                'publisher_id' => 2,
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
    public function index(GetPodcastListAction $action)
    {
        $perPage = request()->query('per_page');
        $podcasts = $action->handle($perPage);
        return PodcastResource::collection($podcasts);
    }


    #[OA\Post(
        path: '/api/podcasts',
        description: 'Create a new podcast',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['title'],
                    properties: [
                        new OA\Property(property: 'title', type: 'string', example: 'Kane and Abel'),
                        new OA\Property(property: 'description', type: 'string', example: '"Kane and Abel" can refer to two distinct narratives: a biblical story and a novel by Jeffrey Archer.'),
                        new OA\Property(property: 'slug', type: 'string', example: 'kane-and-abel'),
                        new OA\Property(property: 'publisher_id', type: 'integer', example: 1),
                        new OA\Property(
                            property: 'cover_image',
                            type: 'string',
                            format: 'binary',
                            description: 'Image file for cover'
                        ),
                    ]
                )
            )
        ),
        tags: ['Podcast'],
        responses: [
            new OA\Response(response: 201, description: 'Podcast created')
        ]
    )]
    public function store(CreatePodcastRequest $request, CreatePodcastAction $action)
    {
        $record = $action->handle($request->validated());
        return response()->json([
            'message' => 'podcast created successfully. ',
        ], 201);
    }

    #[OA\Get(
        path: '/api/podcasts/{podcast}',
        description: 'Get a podcast by ID',
        parameters: [
            new OA\Parameter(name: 'podcast', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        tags: ['Podcast'],
        responses: [
            new OA\Response(response: 200, description: 'Podcast found')
        ]
    )]
    public function show(Podcast $podcast)
    {
        return new PodcastResource($podcast);
    }

    #[OA\Put(
        path: '/api/podcasts/{podcast}',
        description: 'Update a podcast',
        operationId: 'updatePodcast',
        tags: ['Podcast'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['title'],
                    properties: [
                        new OA\Property(property: 'title', type: 'string', example: 'Kane and Abel'),
                        new OA\Property(property: 'description', type: 'string', example: 'Some description'),
                        new OA\Property(property: 'slug', type: 'string', example: 'kane-and-abel'),
                        new OA\Property(property: 'cover_image', type: 'string', format: 'binary'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Podcast updated successfully'),
            new OA\Response(response: 422, description: 'Validation failed')
        ]
    )]
    public function update(UpdatePodcastRequest $request, Podcast $podcast, UpdatePodcastAction $action)
    {
        $data = $request->validated();

        $updated = $action->handle($podcast, $data);

        return response()->json([
            'message' => 'Podcast updated successfully.',
            'data' => $updated,
        ], 200);
    }


    #[OA\Delete(
        path: '/api/podcasts/{id}',
        description: 'Delete a podcast',
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        tags: ['Podcast'],
        responses: [
            new OA\Response(response: 204, description: 'Podcast deleted')
        ]
    )]
    public function destroy(Podcast $podcast, DeletePodcastAction $action)
    {
        $action->handle($podcast);

        return response()->json([
            'message' => 'Podcast deleted successfully.',
        ], 204);
    }
}
