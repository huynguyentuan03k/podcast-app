<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;

#[OA\Info(
    version: '1.0.0',
    title: 'API Documentation',
    description: 'Podcast API Documentation',
    contact: new OA\Contact(
        name: 'company',
        url: 'https://example.test',
        email: 'admin@example.test'
    ),
    license: new OA\License(
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
    )
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'Local Server'
)]
class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
