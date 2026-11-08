<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'E-commerce API',
    description: 'REST API for managing customers, a product catalog, orders and Stripe payments.',
    contact: new OA\Contact(name: 'API Support', email: 'support@example.com'),
    license: new OA\License(name: 'MIT'),
)]
#[OA\Server(url: '/api', description: 'API server')]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Provide a valid JWT access token as a Bearer token.',
)]
#[OA\Tag(name: 'Authentication', description: 'Registration, login and token lifecycle')]
#[OA\Tag(name: 'Products', description: 'Public catalog and admin product management')]
#[OA\Tag(name: 'Orders', description: 'Order creation and purchase history')]
#[OA\Tag(name: 'Payments', description: 'Stripe checkout sessions and webhooks')]
final class ApiInfo {}
