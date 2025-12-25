<?php

namespace App\Http\Controllers\Api;

use App\Actions\GetAuthorListAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\AuthorResource;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AuthorController extends Controller
{
         #[OA\Get(
        path: '/api/authors',
        description: 'Get a filtered list of authors',
        tags: ['Author'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'slug', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'description', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'all', in: 'query', description: 'Search all fields', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', example: 1)),
            new OA\Parameter(name: 'fields[authors]', in: 'query', schema: new OA\Schema(type: 'string', example: '')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of authors',
                content: new OA\JsonContent(
                    example: [
                        'data' => [
                            [
                                'id' => 1,
                                'name' => 'Example author',
                                'slug' => 'example-author',
                                'description' => 'A author of great content',
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
    public function index(GetAuthorListAction $action)
    {
        $perPage = request()->query('per_page');
        $author = $action->handle($perPage);
        return AuthorResource::collection($author);
    }
}
