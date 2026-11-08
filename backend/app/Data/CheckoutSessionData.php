<?php

namespace App\Data;

use App\Models\Payment;

final readonly class CheckoutSessionData
{
    public function __construct(
        public Payment $payment,
        public string $checkoutUrl,
    ) {}
}
