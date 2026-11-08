<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Store Currency
    |--------------------------------------------------------------------------
    |
    | ISO 4217 currency code used for orders and payments. Stripe requires
    | amounts to be handled in the smallest currency unit.
    |
    */

    'currency' => strtolower(env('STRIPE_CURRENCY', 'usd')),

    /*
    |--------------------------------------------------------------------------
    | Tax Rate
    |--------------------------------------------------------------------------
    |
    | Decimal rate applied on top of the order subtotal (e.g. 0.16 = 16%).
    |
    */

    'tax_rate' => (float) env('TAX_RATE', 0),

    /*
    |--------------------------------------------------------------------------
    | Order Number Prefix
    |--------------------------------------------------------------------------
    */

    'order_prefix' => env('ORDER_PREFIX', 'ORD'),

];
