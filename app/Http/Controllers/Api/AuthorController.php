<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreateAuthorAction;
use App\Actions\DeleteAuthorAction;
use App\Actions\GetAuthorListAction;
use App\Actions\UpdateAuthorAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateAuthorRequest;
use App\Http\Requests\UpdateAuthorRequest;
use App\Http\Resources\AuthorResource;
use App\Models\Author;
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

        #[OA\Get(
        path: '/api/authors/{author}',
        summary: 'Get a single author',
        description: 'Retrieve detailed information about a specific author by ID.',
        tags: ['Author'],
        parameters: [
            new OA\Parameter(
                name: 'author',
                in: 'path',
                required: true,
                description: 'ID of the author to retrieve',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Author retrieved successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'author show successfully',
                        'data' => [
                            'id' => 1,
                            'name' => 'Example Author',
                            'description' => '123 Main St, City',
                        ]
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: 'Author not found'
            )
        ]
    )]
    public function show(Author $author){
        return response()->json([
            'message' => 'author show successfully',
            'data' => new AuthorResource($author)
        ]);
    }

        #[OA\Post(
        path: '/api/authors',
        description: 'Create a new author',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    required: ['name'],
                    properties: [
                        new OA\Property(property: 'name', type: 'string', example: 'j.k.rowling'),
                        new OA\Property(property: 'description', type: 'string', example: 'j.k.rowling'),
                    ]
                )
            )
        ),
        tags: ['Author'],
        responses: [
            new OA\Response(response: 201, description: 'Author created')
        ]
    )]
    public function store(CreateAuthorRequest $request, CreateAuthorAction $action)
    {
        $record = $action->handle($request->validated());

        return response()->json([
            'message' => 'Author created successfully.',
            'data' => $record,
        ], 201);
    }


        #[OA\Put(
        path: '/api/authors/{author}',
        summary: 'Update a author',
        description: 'Update the information of an existing author by ID.',
        tags: ['Author'],
        parameters: [
            new OA\Parameter(
                name: 'author',
                in: 'path',
                required: true,
                description: 'ID of the author to update',
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
                        new OA\Property(property: 'name', type: 'string', example: 'Updated author Name'),
                        // new OA\Property(property: 'description', type: 'string', example: '123 Main St, City'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Author updated successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'Author updated successfully.',
                        'data' => [
                            'id' => 1,
                            'name' => 'Updated Author Name',
                            'description' => '123 Main St, City',
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
                description: 'Category not found'
            )
        ]
    )]
    public function update(UpdateAuthorRequest $request, Author $author, UpdateAuthorAction $action)
    {
        $data = $request->validated();

        $updated = $action->handle( $data,$author,);

        return response()->json([
            'message' => 'author updated successfully.',
            'data' => $updated,
        ], 200);
    }

      #[OA\Delete(
        path: '/api/authors/{authors}',
        summary: 'Delete a author',
        description: 'Permanently delete a author by ID.',
        tags: ['Author'],
        parameters: [
            new OA\Parameter(
                name: 'author',
                in: 'path',
                required: true,
                description: 'ID of the author to delete',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Author deleted successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'Author deleted successfully.'
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: 'Author not found'
            ),
            new OA\Response(
                response: 500,
                description: 'Server error - Unable to delete Author'
            )
        ]
    )]
    public function destroy(Author $author,DeleteAuthorAction $action){
        $result = $action->handle($author);
        return response()->json([
            'message' => 'category deleted successfully...',
        ],201);
    }
}
