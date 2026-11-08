<?php

namespace App\Exceptions;

class ProductUnavailableException extends DomainException
{
    public function __construct(public readonly int $productId)
    {
        parent::__construct("Product {$productId} is not available for purchase.");
    }

    public function statusCode(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'PRODUCT_UNAVAILABLE';
    }

    /**
     * @return array<string, mixed>
     */
    public function errors(): array
    {
        return ['product_id' => $this->productId];
    }
}
