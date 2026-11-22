<?php

use App\Http\Controllers\Api\RequestHistoryController;
use App\Http\Controllers\Api\RequestStatusController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('requests', ServiceRequestController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['requests' => 'serviceRequest']);

    Route::get('requests/{serviceRequest}/history', [RequestHistoryController::class, 'index']);
    Route::patch('requests/{serviceRequest}/status', [RequestStatusController::class, 'update']);
});
