<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

final class OrderPaths
{
    #[OA\Get(
        path: '/v1/orders',
        summary: 'List orders',
        description: 'Returns the authenticated user purchase history. Users with the "view orders" permission see every order.',
        tags: ['Orders'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'])),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Orders list.', content: new OA\JsonContent(ref: '#/components/schemas/OrderCollection')),
            new OA\Response(response: 401, description: 'Unauthenticated.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function index(): void {}

    #[OA\Post(
        path: '/v1/orders',
        summary: 'Create an order',
        description: 'Creates a pending order from catalog products and validates stock and availability.',
        tags: ['Orders'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/OrderInput')),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Order created.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Order created.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Order'),
                ]),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 422, description: 'Validation or stock error.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function store(): void {}

    #[OA\Get(
        path: '/v1/orders/{order}',
        summary: 'Show an order',
        description: 'Owners and users with the "view orders" permission can access an order.',
        tags: ['Orders'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Order detail.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Order detail.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Order'),
                ]),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 403, description: 'Forbidden.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 404, description: 'Resource not found.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function show(): void {}
}
