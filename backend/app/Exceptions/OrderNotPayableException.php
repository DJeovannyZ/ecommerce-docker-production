<?php

namespace App\Exceptions;

class OrderNotPayableException extends DomainException
{
    public function __construct(public readonly int $orderId)
    {
        parent::__construct("Order {$orderId} is not payable in its current state.");
    }

    public function statusCode(): int
    {
        return 409;
    }

    public function errorCode(): string
    {
        return 'ORDER_NOT_PAYABLE';
    }

    /**
     * @return array<string, mixed>
     */
    public function errors(): array
    {
        return ['order_id' => $this->orderId];
    }
}
