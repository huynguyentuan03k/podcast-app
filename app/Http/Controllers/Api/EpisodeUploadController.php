<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Aws\S3\S3Client;

class EpisodeUploadController extends Controller
{
    public function generatePresignedUrl(Request $request)
    {
        $request->validate([
            'filename' => 'required|string',
            'content_type' => 'required|string',
        ]);

        $key = 'episodes/' . Str::random(40) . '_' . $request->filename;

        $s3 = new App\Http\Controllers\S3Client([
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'version' => 'latest',
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
            'endpoint' => env('AWS_ENDPOINT'), // <- quan trọng nếu dùng MinIO
            'use_path_style_endpoint' => true,
        ]);

        $cmd = $s3->getCommand('PutObject', [
            'Bucket' => env('AWS_BUCKET'),
            'Key' => $key,
            'ContentType' => $request->content_type,
        ]);

        $request = $s3->createPresignedRequest($cmd, '+20 minutes');

        return response()->json([
            'url' => (string) $request->getUri(),
            'path' => $key,
        ]);
    }
}
