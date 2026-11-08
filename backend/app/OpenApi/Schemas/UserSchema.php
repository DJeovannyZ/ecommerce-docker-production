<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'User',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Jane Doe'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jane@example.com'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, example: '555-0100'),
        new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'string'), example: ['customer']),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
    ],
)]
final class UserSchema {}
