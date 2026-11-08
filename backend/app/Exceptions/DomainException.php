<?php

namespace App\Exceptions;

use RuntimeException;

abstract class DomainException extends RuntimeException
{
    abstract public function statusCode(): int;

    abstract public function errorCode(): string;

    /**
     * @return array<string, mixed>
     */
    public function errors(): array
    {
        return [];
    }
}
