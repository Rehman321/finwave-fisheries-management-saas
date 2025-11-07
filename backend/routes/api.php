<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ServiceTypeController;
use App\Http\Controllers\Api\ZoneController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\BookingTypeController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\AuthController;

// Admin-only resource routes
Route::middleware(['auth:sanctum', \App\Http\Middleware\RoleMiddleware::class . ':admin'])->group(function () {
	Route::apiResource('roles', RoleController::class);
	Route::apiResource('service-types', ServiceTypeController::class);
	Route::apiResource('booking-types', BookingTypeController::class);
});

// Public/resource routes (may be protected later as needed)
Route::apiResource('zones', ZoneController::class);
Route::apiResource('cities', CityController::class);
Route::apiResource('customers', CustomerController::class);
Route::apiResource('bookings', BookingController::class);

use App\Http\Controllers\Api\V1\AuthController as V1AuthController;

Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [V1AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [V1AuthController::class, 'logout']);
        Route::get('/auth/me', [V1AuthController::class, 'me']);
    });

    // Admin token management (list/revoke tokens)
    Route::middleware(['auth:sanctum', \App\Http\Middleware\RoleMiddleware::class . ':admin'])->prefix('admin')->group(function () {
        Route::get('/users/{user}/tokens', [\App\Http\Controllers\Api\V1\Admin\UserTokenController::class, 'index']);
        Route::delete('/users/{user}/tokens/{token}', [\App\Http\Controllers\Api\V1\Admin\UserTokenController::class, 'destroy']);
        Route::delete('/users/{user}/tokens', [\App\Http\Controllers\Api\V1\Admin\UserTokenController::class, 'destroyAll']);
    });
});
