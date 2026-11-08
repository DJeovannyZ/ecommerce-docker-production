<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'OrderInput',
    type: 'object',
    required: ['items'],
    properties: [
        new OA\Property(
            property: 'items',
            type: 'array',
            minItems: 1,
            maxItems: 50,
            items: new OA\Items(
                type: 'object',
                required: ['product_id', 'quantity'],
                properties: [
                    new OA\Property(property: 'product_id', type: 'integer', example: 1),
                    new OA\Property(property: 'quantity', type: 'integer', minimum: 1, example: 2),
                ],
            ),
        ),
    ],
)]
final class OrderInputSchema {}
