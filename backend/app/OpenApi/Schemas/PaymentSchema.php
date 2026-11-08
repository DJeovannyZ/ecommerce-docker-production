<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Payment',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'order_id', type: 'integer', example: 1),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'paid', 'failed', 'refunded'], example: 'pending'),
        new OA\Property(property: 'status_label', type: 'string', example: 'Pending'),
        new OA\Property(property: 'currency', type: 'string', example: 'usd'),
        new OA\Property(property: 'amount', type: 'number', format: 'float', example: 179.98),
        new OA\Property(property: 'stripe_session_id', type: 'string', nullable: true, example: 'cs_test_a1b2c3'),
        new OA\Property(property: 'stripe_payment_intent_id', type: 'string', nullable: true, example: 'pi_test_a1b2c3'),
        new OA\Property(property: 'failure_reason', type: 'string', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
    ],
)]
final class PaymentSchema {}
