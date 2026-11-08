<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

final class ApiResponse
{
    public static function wantsJson(Request $request): bool
    {
        return $request->is('api/*') || $request->expectsJson();
    }

    public static function success(mixed $data = null, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function created(mixed $data = null, string $message = 'Resource created.'): JsonResponse
    {
        return self::success($data, $message, 201);
    }

    public static function resource(JsonResource $resource, string $message = 'OK', int $status = 200): JsonResponse
    {
        return $resource
            ->additional(['success' => true, 'message' => $message])
            ->response()
            ->setStatusCode($status);
    }

    public static function collection(ResourceCollection $collection, string $message = 'OK', int $status = 200): JsonResponse
    {
        return $collection
            ->additional(['success' => true, 'message' => $message])
            ->response()
            ->setStatusCode($status);
    }

    public static function noContent(): Response
    {
        return response()->noContent();
    }

    /**
     * @param  array<string, mixed>  $errors
     */
    public static function error(
        string $message,
        int $status = 400,
        array $errors = [],
        ?string $code = null,
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => (object) $errors,
            'code' => $code,
        ], $status);
    }
}
