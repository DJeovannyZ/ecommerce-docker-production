<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'ProductInput',
    type: 'object',
    required: ['name', 'price', 'stock'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Wireless Headphones'),
        new OA\Property(property: 'slug', type: 'string', nullable: true, example: 'wireless-headphones'),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'price', type: 'number', format: 'float', minimum: 0, example: 89.99),
        new OA\Property(property: 'stock', type: 'integer', minimum: 0, example: 50),
        new OA\Property(property: 'image_url', type: 'string', nullable: true),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
    ],
)]
final class ProductInputSchema {}
