<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Auth\InvalidTokenException;
use App\Services\Auth\JwtService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly JwtService $jwt,
    ) {
    }

    /**
     * POST /auth/token — выпуск токена.
     */
    public function token(): JsonResponse
    {
        return response()->json($this->jwt->issue());
    }

    /**
     * POST /auth/refresh — пролонгация токена.
     */
    public function refresh(Request $request): JsonResponse
    {
        $token = $request->bearerToken() ?? throw new AuthenticationException();

        try {
            return response()->json($this->jwt->refresh($token));
        } catch (InvalidTokenException) {
            throw new AuthenticationException();
        }
    }
}
