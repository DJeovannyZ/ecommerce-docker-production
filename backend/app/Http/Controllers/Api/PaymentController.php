<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Services\StripePaymentService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Exception\SignatureVerificationException;
use UnexpectedValueException;

class PaymentController extends Controller
{
    public function __construct(private readonly StripePaymentService $payments) {}

    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $payment = $order->payment()->first();

        if ($payment === null) {
            return ApiResponse::error('No payment found for this order.', 404, code: 'PAYMENT_NOT_FOUND');
        }

        return ApiResponse::resource(new PaymentResource($payment), 'Payment detail.');
    }

    public function webhook(Request $request): JsonResponse
    {
        try {
            $this->payments->handleWebhook(
                $request->getContent(),
                $request->header('Stripe-Signature'),
            );
        } catch (SignatureVerificationException) {
            return ApiResponse::error('Invalid webhook signature.', 400, code: 'INVALID_SIGNATURE');
        } catch (UnexpectedValueException) {
            return ApiResponse::error('Invalid webhook payload.', 400, code: 'INVALID_PAYLOAD');
        }

        return ApiResponse::success(null, 'Webhook handled.');
    }
}
