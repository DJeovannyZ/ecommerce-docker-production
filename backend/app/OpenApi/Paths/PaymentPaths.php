<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

final class PaymentPaths
{
    #[OA\Post(
        path: '/v1/orders/{order}/checkout',
        summary: 'Create a Stripe checkout session',
        description: 'Creates a Stripe Checkout Session for a pending order and returns the hosted checkout URL.',
        tags: ['Payments'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Checkout session created.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Checkout session created.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Checkout'),
                ]),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 403, description: 'Forbidden.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 404, description: 'Resource not found.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 409, description: 'Order is not payable.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function checkout(): void {}

    #[OA\Get(
        path: '/v1/orders/{order}/payment',
        summary: 'Show the payment of an order',
        tags: ['Payments'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Payment detail.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Payment detail.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Payment'),
                ]),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 403, description: 'Forbidden.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 404, description: 'Payment not found.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function show(): void {}

    #[OA\Post(
        path: '/v1/payments/webhook',
        summary: 'Stripe webhook endpoint',
        description: 'Receives Stripe events. Signature is verified when STRIPE_WEBHOOK_SECRET is configured.',
        tags: ['Payments'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(example: ['id' => 'evt_test', 'type' => 'checkout.session.completed', 'data' => ['object' => ['id' => 'cs_test', 'metadata' => ['order_id' => '1']]]]),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Webhook handled.', content: new OA\JsonContent(ref: '#/components/schemas/Message')),
            new OA\Response(response: 400, description: 'Invalid signature or payload.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function webhook(): void {}
}
