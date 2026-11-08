<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'RegisterInput',
    type: 'object',
    required: ['name', 'email', 'password', 'password_confirmation'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Jane Doe'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jane@example.com'),
        new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8, example: 'secret-password'),
        new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'secret-password'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, example: '555-0100'),
    ],
)]
final class RegisterInputSchema {}
