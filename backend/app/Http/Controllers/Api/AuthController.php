<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());
        $user->assignRole('customer');

        $token = Auth::guard('api')->login($user);

        return ApiResponse::success([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => new UserResource($user->load('roles')),
        ], 'User registered successfully.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! $token = Auth::guard('api')->attempt($credentials)) {
            return ApiResponse::error('Invalid credentials.', 401, code: 'INVALID_CREDENTIALS');
        }

        $user = Auth::guard('api')->user();

        return ApiResponse::success($this->tokenPayload($token, $user), 'Logged in successfully.');
    }

    public function me(): JsonResponse
    {
        $user = Auth::guard('api')->user()->load('roles');

        return ApiResponse::resource(new UserResource($user), 'Authenticated user.');
    }

    public function logout(): JsonResponse
    {
        Auth::guard('api')->logout();

        return ApiResponse::success(null, 'Successfully logged out.');
    }

    public function refresh(): JsonResponse
    {
        try {
            $token = Auth::guard('api')->refresh();
        } catch (JWTException) {
            return ApiResponse::error('The token could not be refreshed.', 401, code: 'TOKEN_INVALID');
        }

        $user = Auth::guard('api')->setToken($token)->user();

        return ApiResponse::success($this->tokenPayload($token, $user), 'Token refreshed.');
    }

    /**
     * @return array<string, mixed>
     */
    private function tokenPayload(string $token, User $user): array
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => new UserResource($user->load('roles')),
        ];
    }
}
