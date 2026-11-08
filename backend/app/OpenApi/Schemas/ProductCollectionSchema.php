<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'ProductCollection',
    type: 'object',
    properties: [
        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Product')),
        new OA\Property(property: 'links', type: 'object', example: ['first' => '/api/v1/products?page=1', 'last' => '/api/v1/products?page=4', 'prev' => null, 'next' => '/api/v1/products?page=2']),
        new OA\Property(property: 'meta', type: 'object', example: ['current_page' => 1, 'per_page' => 15, 'total' => 50, 'last_page' => 4]),
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Products list.'),
    ],
)]
final class ProductCollectionSchema {}
