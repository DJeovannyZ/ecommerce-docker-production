<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'OrderCollection',
    type: 'object',
    properties: [
        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Order')),
        new OA\Property(property: 'links', type: 'object', example: ['first' => '/api/v1/orders?page=1', 'last' => '/api/v1/orders?page=2', 'prev' => null, 'next' => '/api/v1/orders?page=2']),
        new OA\Property(property: 'meta', type: 'object', example: ['current_page' => 1, 'per_page' => 15, 'total' => 20, 'last_page' => 2]),
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Orders list.'),
    ],
)]
final class OrderCollectionSchema {}
