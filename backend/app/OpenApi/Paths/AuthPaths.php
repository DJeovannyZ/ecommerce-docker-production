<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

final class AuthPaths
{
    #[OA\Post(
        path: '/v1/auth/register',
        summary: 'Register a new customer',
        description: 'Creates a customer account and returns a JWT access token.',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/RegisterInput'),
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'User registered successfully.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'User registered successfully.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/AuthToken'),
                ]),
            ),
            new OA\Response(response: 422, description: 'Validation error.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function register(): void {}

    #[OA\Post(
        path: '/v1/auth/login',
        summary: 'Authenticate a user',
        description: 'Validates credentials and returns a JWT access token.',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/LoginInput'),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Logged in successfully.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Logged in successfully.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/AuthToken'),
                ]),
            ),
            new OA\Response(response: 401, description: 'Invalid credentials.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 422, description: 'Validation error.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function login(): void {}

    #[OA\Get(
        path: '/v1/auth/me',
        summary: 'Get the authenticated user',
        tags: ['Authentication'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Authenticated user.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Authenticated user.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/User'),
                ]),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function me(): void {}

    #[OA\Post(
        path: '/v1/auth/logout',
        summary: 'Log the current user out',
        description: 'Invalidates the presented JWT token.',
        tags: ['Authentication'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successfully logged out.', content: new OA\JsonContent(ref: '#/components/schemas/Message')),
            new OA\Response(response: 401, description: 'Unauthenticated.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function logout(): void {}

    #[OA\Post(
        path: '/v1/auth/refresh',
        summary: 'Refresh the JWT token',
        tags: ['Authentication'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Token refreshed.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Token refreshed.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/AuthToken'),
                ]),
            ),
            new OA\Response(response: 401, description: 'Token could not be refreshed.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function refresh(): void {}
}
