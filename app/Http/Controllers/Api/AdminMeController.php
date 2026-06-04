<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AdminMeController extends Controller
{
    #[OA\Get(
        path: '/api/admin/auth/me',
        description: 'Get current authenticated admin',
        tags: ['Admin Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Current admin retrieved successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Current admin retrieved successfully.',
            'data' => $request->user(),
        ]);
    }
}
