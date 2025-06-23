<?php

namespace App\Http\Controllers\Api;

use App\Actions\GetEpisodeListAction;
use App\Http\Controllers\Controller;
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
