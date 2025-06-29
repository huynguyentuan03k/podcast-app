<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreateEpisodeAction;
use App\Actions\GetEpisodeListAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateEpisodeRequest;
use App\Http\Resources\EpisodeResource;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class EpisodeController extends Controller
{
    #[OA\Get(
        path: '/api/episodes',
        description: 'Get a filtered and sorted list of episodes',
        tags: ['Episode'],
        parameters: [
            new OA\Parameter(name: 'filter[podcast_id]', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'filter[title]', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'filter[description]', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'filter[audio_file]', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'filter[duration]', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'filter[published_at]', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),

            new OA\Parameter(name: 'sort', in: 'query', example: '-created_at', schema: new OA\Schema(
                type: 'string',
                description: 'Comma-separated list of fields to sort by. Prefix with "-" for descending order.'
            )),

            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of episodes',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'title' => 'Episode 1',
                                'description' => 'This is episode 1',
                                'audio_file' => '/storage/episodes/audio.mp3',
                                'duration' => '00:03:15',
                                'published_at' => '2025-06-22T00:00:00.000000Z',
                                'podcast_id' => 1,
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
    public function index(GetEpisodeListAction $action)
    {
        $perPage = request()->query('per_page');
        $episode = $action->handle($perPage);
        return EpisodeResource::collection($episode);
    }

    #[OA\Post(
        path: '/api/episodes',
        description: 'Create a new episode with audio file upload',
        tags: ['Episode'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    type: 'object',
                    required: ['title', 'slug','podcast_id'],
                    properties: [
                        new OA\Property(property: 'title', type: 'string', example: 'Episode 1'),
                        new OA\Property(property: 'slug', type: 'string', example: 'episode-1'),
                        new OA\Property(property: 'description', type: 'string', example: 'This is episode 1'),
                        new OA\Property(
                            property: 'audio_path',
                            type: 'string',
                            format: 'binary',
                            description: 'Audio file to upload (e.g. .mp3)'
                        ),
                        new OA\Property(
                            property: 'cover_image',
                            type: 'string',
                            format: 'binary',
                            description: 'Cover image to upload (.jpg, .png, etc)'
                        ),
                        new OA\Property(property: 'duration', type: 'integer', example: 195),
                        new OA\Property(property: 'podcast_id', type: 'integer', example: 7),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Episode created successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'created episode successfully'
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error'
            )
        ]
    )]
    public function store(CreateEpisodeRequest $request, CreateEpisodeAction $action)
    {

        $data = $request->validated();
        $episode = $action->handle($data);
        return response()->json([
            'message' => 'created episode successfully'
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
