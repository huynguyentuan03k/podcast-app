<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use OpenApi\Annotations as OA;

class TestSwaggerController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/test",
     *     summary="Test Swagger endpoint",
     *     tags={"Swagger Test"},
     *     @OA\Response(
     *         response=200,
     *         description="Success"
     *     )
     * )
     */
    public function __invoke(): JsonResponse
    {
        return response()->json(['message' => 'Swagger is working!']);
    }
}
