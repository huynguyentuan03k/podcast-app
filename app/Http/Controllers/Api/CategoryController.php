<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreateCategoryAction;
use App\Actions\CreatePublisherAction;
use App\Actions\DeleteCategoryAction;
use App\Actions\DeletePublisherAction;
use App\Actions\GetCategoryListAction;
use App\Actions\GetPublisherListAction;
use App\Actions\UpdateCategoryAction;
use App\Actions\UpdatePublisherAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateCategoryRequest;
use App\Http\Requests\CreatePublisherRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Requests\UpdatePublisherRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\PublisherResource;
use App\Models\Category;
use App\Models\Publisher;
use OpenApi\Attributes as OA;


class CategoryController extends Controller
{
     #[OA\Get(
        path: '/api/categories',
        description: 'Get a filtered list of categories',
        tags: ['Category'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'name', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'slug', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'description', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'all', in: 'query', description: 'Search all fields', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sort', in: 'query', schema: new OA\Schema(type: 'string', example: '')),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', example: 10)),
            new OA\Parameter(name: 'fields[categories]', in: 'query', schema: new OA\Schema(type: 'string', example: '')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of categories',
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
    public function index(GetCategoryListAction $action)
    {
        $perPage = request()->query('per_page');
        $category = $action->handle($perPage);
        return CategoryResource::collection($category);
    }

    #[OA\Get(
        path: '/api/categories/{category}',
        summary: 'Get a single category',
        description: 'Retrieve detailed information about a specific category by ID.',
        tags: ['Category'],
        parameters: [
            new OA\Parameter(
                name: 'category',
                in: 'path',
                required: true,
                description: 'ID of the category to retrieve',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Category retrieved successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'category show successfully',
                        'data' => [
                            'id' => 1,
                            'name' => 'Example Category',
                            'description' => '123 Main St, City',
                        ]
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: 'Category not found'
            )
        ]
    )]
    public function show(Category $category){
        return response()->json([
            'message' => 'category show successfully',
            'data' => new CategoryResource($category)
        ]);
    }

    #[OA\Post(
        path: '/api/categories',
        description: 'Create a new category',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    required: ['name'],
                    properties: [
                        new OA\Property(property: 'name', type: 'string', example: 'OpenAI'),
                        new OA\Property(property: 'description', type: 'string', example: 'San Francisco'),
                    ]
                )
            )
        ),
        tags: ['Category'],
        responses: [
            new OA\Response(response: 201, description: 'Category created')
        ]
    )]
    public function store(CreateCategoryRequest $request, CreateCategoryAction $action)
    {
        $record = $action->handle($request->validated());

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => $record,
        ], 201);
    }


    #[OA\Put(
        path: '/api/categories/{category}',
        summary: 'Update a category',
        description: 'Update the information of an existing category by ID.',
        tags: ['Category'],
        parameters: [
            new OA\Parameter(
                name: 'category',
                in: 'path',
                required: true,
                description: 'ID of the category to update',
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
                        new OA\Property(property: 'name', type: 'string', example: 'Updated category Name'),
                        new OA\Property(property: 'description', type: 'string', example: '123 Main St, City'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Category updated successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'category updated successfully.',
                        'data' => [
                            'id' => 1,
                            'name' => 'Updated Category Name',
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
    public function update(UpdateCategoryRequest $request, Category $category, UpdateCategoryAction $action)
    {
        $data = $request->validated();

        $updated = $action->handle($category, $data);

        return response()->json([
            'message' => 'category updated successfully.',
            'data' => $updated,
        ], 200);
    }

   #[OA\Delete(
        path: '/api/categories/{category}',
        summary: 'Delete a category',
        description: 'Permanently delete a category by ID.',
        tags: ['Category'],
        parameters: [
            new OA\Parameter(
                name: 'category',
                in: 'path',
                required: true,
                description: 'ID of the category to delete',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Category deleted successfully',
                content: new OA\JsonContent(
                    example: [
                        'message' => 'category deleted successfully.'
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: 'Category not found'
            ),
            new OA\Response(
                response: 500,
                description: 'Server error - Unable to delete category'
            )
        ]
    )]
    public function destroy(Category $category,DeleteCategoryAction $action){
        $result = $action->handle($category);
        return response()->json([
            'message' => 'category deleted successfully.',
        ],201);
    }
}
