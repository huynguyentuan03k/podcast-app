<?php

use App\Http\Controllers\Api\TestSwaggerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', TestSwaggerController::class);
