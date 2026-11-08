<?php

namespace App\Exceptions;

class InsufficientStockException extends DomainException
{
    public function __construct(
        public readonly int $productId,
        public readonly int $requested,
        public readonly int $available,
    ) {
        parent::__construct("Not enough stock for product {$productId}. Requested {$requested}, available {$available}.");
    }

    public function statusCode(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'INSUFFICIENT_STOCK';
    }

    /**
     * @return array<string, mixed>
     */
    public function errors(): array
    {
        return [
            'product_id' => $this->productId,
            'requested' => $this->requested,
            'available' => $this->available,
        ];
    }
}
