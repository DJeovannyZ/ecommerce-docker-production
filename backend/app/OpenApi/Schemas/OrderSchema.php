<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Order',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'order_number', type: 'string', example: 'ORD-20260101-A1B2C3'),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], example: 'pending'),
        new OA\Property(property: 'status_label', type: 'string', example: 'Pending'),
        new OA\Property(property: 'subtotal', type: 'number', format: 'float', example: 179.98),
        new OA\Property(property: 'tax', type: 'number', format: 'float', example: 0),
        new OA\Property(property: 'total', type: 'number', format: 'float', example: 179.98),
        new OA\Property(property: 'currency', type: 'string', example: 'usd'),
        new OA\Property(property: 'items', type: 'array', items: new OA\Items(ref: '#/components/schemas/OrderItem')),
        new OA\Property(property: 'payment', ref: '#/components/schemas/Payment', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
    ],
)]
final class OrderSchema {}
