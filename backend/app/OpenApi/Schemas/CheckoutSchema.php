<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Checkout',
    type: 'object',
    properties: [
        new OA\Property(property: 'checkout_url', type: 'string', example: 'https://checkout.stripe.com/c/pay/cs_test_a1b2c3'),
        new OA\Property(property: 'payment', ref: '#/components/schemas/Payment'),
    ],
)]
final class CheckoutSchema {}
