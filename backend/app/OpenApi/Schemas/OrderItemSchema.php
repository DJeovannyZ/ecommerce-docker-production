<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'OrderItem',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'product_id', type: 'integer', example: 1),
        new OA\Property(property: 'product_name', type: 'string', example: 'Wireless Headphones'),
        new OA\Property(property: 'unit_price', type: 'number', format: 'float', example: 89.99),
        new OA\Property(property: 'quantity', type: 'integer', example: 2),
        new OA\Property(property: 'line_total', type: 'number', format: 'float', example: 179.98),
    ],
)]
final class OrderItemSchema {}
