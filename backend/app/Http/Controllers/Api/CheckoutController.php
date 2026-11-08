<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Services\StripePaymentService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(private readonly StripePaymentService $payments) {}

    public function store(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $checkout = $this->payments->createCheckoutSession($order);

        return ApiResponse::success([
            'checkout_url' => $checkout->checkoutUrl,
            'payment' => new PaymentResource($checkout->payment),
        ], 'Checkout session created.');
    }
}
