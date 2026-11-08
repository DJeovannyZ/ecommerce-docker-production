<?php

use App\Exceptions\DomainException;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request): bool => $request->is('api/*') || $request->expectsJson()
        );

        $exceptions->render(function (ValidationException $e, Request $request) {
            if (! ApiResponse::wantsJson($request)) {
                return null;
            }

            return ApiResponse::error(
                message: $e->getMessage(),
                status: 422,
                errors: $e->errors(),
                code: 'VALIDATION_ERROR',
            );
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if (! ApiResponse::wantsJson($request)) {
                return null;
            }

            return ApiResponse::error('Unauthenticated.', 401, code: 'UNAUTHENTICATED');
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) {
            if (! ApiResponse::wantsJson($request)) {
                return null;
            }

            return ApiResponse::error(
                $e->getMessage() ?: 'This action is unauthorized.',
                403,
                code: 'FORBIDDEN',
            );
        });

        $exceptions->render(function (DomainException $e, Request $request) {
            if (! ApiResponse::wantsJson($request)) {
                return null;
            }

            return ApiResponse::error(
                $e->getMessage(),
                $e->statusCode(),
                $e->errors(),
                $e->errorCode(),
            );
        });

        $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
            if (! ApiResponse::wantsJson($request)) {
                return null;
            }

            $status = $e->getStatusCode();

            $message = match ($status) {
                401 => 'Unauthenticated.',
                403 => $e->getMessage() !== '' ? $e->getMessage() : 'This action is unauthorized.',
                404 => 'Resource not found.',
                405 => 'Method not allowed.',
                429 => 'Too many requests.',
                default => $e->getMessage() !== '' ? $e->getMessage() : 'Request failed.',
            };

            $code = match ($status) {
                401 => 'UNAUTHENTICATED',
                403 => 'FORBIDDEN',
                404 => 'NOT_FOUND',
                405 => 'METHOD_NOT_ALLOWED',
                429 => 'TOO_MANY_REQUESTS',
                default => 'HTTP_ERROR',
            };

            return ApiResponse::error($message, $status, code: $code);
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if (! ApiResponse::wantsJson($request) || config('app.debug')) {
                return null;
            }

            return ApiResponse::error('Server Error.', 500, code: 'SERVER_ERROR');
        });
    })->create();
