<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\NoteController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/token', [AuthController::class, 'token']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    Route::middleware('auth:api')->controller(NoteController::class)->group(function () {
        Route::get('/notes', 'index');
        Route::post('/notes', 'store');
        Route::get('/notes/{note}', 'show')->whereNumber('note');
        Route::patch('/notes/{note}', 'update')->whereNumber('note');
        Route::delete('/notes/{note}', 'destroy')->whereNumber('note');
    });
});
