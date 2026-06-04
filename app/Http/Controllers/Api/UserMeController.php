<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class UserMeController extends Controller
{
    #[OA\Get(
        path: '/api/auth/me',
        description: 'Get current authenticated web/mobile user',
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Current user retrieved successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Current user retrieved successfully.',
            'data' => $request->user(),
        ]);
    }
}
