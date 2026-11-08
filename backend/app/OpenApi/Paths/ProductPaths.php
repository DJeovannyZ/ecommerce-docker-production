<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

final class ProductPaths
{
    #[OA\Get(
        path: '/v1/products',
        summary: 'List active products',
        description: 'Returns a paginated list of active products. Public endpoint.',
        tags: ['Products'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1), example: 1),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100), example: 15),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Products list.', content: new OA\JsonContent(ref: '#/components/schemas/ProductCollection')),
        ],
    )]
    public function index(): void {}

    #[OA\Get(
        path: '/v1/products/{product}',
        summary: 'Show a product',
        tags: ['Products'],
        parameters: [
            new OA\Parameter(name: 'product', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Product detail.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Product detail.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Product'),
                ]),
            ),
            new OA\Response(response: 404, description: 'Resource not found.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function show(): void {}

    #[OA\Post(
        path: '/v1/products',
        summary: 'Create a product',
        description: 'Admin only. Requires the "create products" permission.',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/ProductInput')),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Product created.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Product created.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Product'),
                ]),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 403, description: 'Forbidden.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 422, description: 'Validation error.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function store(): void {}

    #[OA\Put(
        path: '/v1/products/{product}',
        summary: 'Update a product',
        description: 'Admin only. Requires the "update products" permission.',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'product', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/ProductInput')),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Product updated.',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Product updated.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Product'),
                ]),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 403, description: 'Forbidden.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 404, description: 'Resource not found.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 422, description: 'Validation error.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function update(): void {}

    #[OA\Delete(
        path: '/v1/products/{product}',
        summary: 'Delete a product',
        description: 'Admin only. Requires the "delete products" permission.',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'product', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Product deleted.'),
            new OA\Response(response: 401, description: 'Unauthenticated.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 403, description: 'Forbidden.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
            new OA\Response(response: 404, description: 'Resource not found.', content: new OA\JsonContent(ref: '#/components/schemas/Error')),
        ],
    )]
    public function destroy(): void {}
}
