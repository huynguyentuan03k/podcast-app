<?php

namespace App\Http\Controllers\Api;

use App\Enums\SettingKey;
use App\Http\Controllers\Controller;
use App\Services\SettingService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class KeywordSuggestionController extends Controller
{
    #[OA\Get(
        path: '/api/keyword-suggestions',
        summary: 'Get all keyword suggestions',
        tags: ['KeywordSuggestion'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of keyword suggestions',
                content: new OA\JsonContent(
                    example: [
                        'data' => ['horror', 'thriller', 'romance']
                    ]
                )
            )
        ]
    )]
    public function index()
    {
        $keywords = SettingService::get(SettingKey::KEYWORD_SUGGESTION, []);
        return response()->json(['data' => $keywords]);
    }

    #[OA\Post(
        path: '/api/keyword-suggestions',
        summary: 'Add a new keyword',
        tags: ['KeywordSuggestion'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'keyword', type: 'string', example: 'horror')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Keyword added successfully')
        ]
    )]
    public function store(Request $request)
    {
        $request->validate(['keyword' => 'required|string|max:255']);

        $keywords = SettingService::get(SettingKey::KEYWORD_SUGGESTION, []);
        $keywords[] = $request->keyword;

        SettingService::set(SettingKey::KEYWORD_SUGGESTION, $keywords);

        return response()->json([
            'message' => 'Keyword added successfully',
            'data' => $keywords,
        ], 201);
    }

    #[OA\Put(
        path: '/api/keyword-suggestions/{index}',
        summary: 'Edit a keyword by index',
        tags: ['KeywordSuggestion'],
        parameters: [
            new OA\Parameter(name: 'index', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'keyword', type: 'string', example: 'sci-fi')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Keyword updated successfully'),
            new OA\Response(response: 404, description: 'Keyword not found')
        ]
    )]
    public function update(Request $request, int $index)
    {
        $request->validate(['keyword' => 'required|string|max:255']);

        $keywords = SettingService::get(SettingKey::KEYWORD_SUGGESTION, []);

        if (!isset($keywords[$index])) {
            return response()->json(['message' => 'Keyword not found'], 404);
        }

        $keywords[$index] = $request->keyword;
        SettingService::set(SettingKey::KEYWORD_SUGGESTION, array_values($keywords));

        return response()->json([
            'message' => 'Keyword updated successfully',
            'data' => $keywords,
        ]);
    }

    #[OA\Delete(
        path: '/api/keyword-suggestions/{index}',
        summary: 'Delete a keyword by index',
        tags: ['KeywordSuggestion'],
        parameters: [
            new OA\Parameter(name: 'index', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Keyword deleted successfully'),
            new OA\Response(response: 404, description: 'Keyword not found')
        ]
    )]
    public function destroy(int $index)
    {
        $keywords = SettingService::get(SettingKey::KEYWORD_SUGGESTION, []);

        if (!isset($keywords[$index])) {
            return response()->json(['message' => 'Keyword not found'], 404);
        }

        unset($keywords[$index]);
        SettingService::set(SettingKey::KEYWORD_SUGGESTION, array_values($keywords));

        return response()->json([
            'message' => 'Keyword deleted successfully',
            'data' => $keywords,
        ]);
    }
}
