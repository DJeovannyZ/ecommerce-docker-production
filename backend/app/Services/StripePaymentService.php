<?php

namespace App\Services;

use App\Data\CheckoutSessionData;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\OrderNotPayableException;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;
use Stripe\Webhook;
use UnexpectedValueException;

class StripePaymentService
{
    private ?StripeClient $client = null;

    public function createCheckoutSession(Order $order): CheckoutSessionData
    {
        if ($order->status !== OrderStatus::Pending) {
            throw new OrderNotPayableException($order->id);
        }

        $order->loadMissing('items');

        $currency = (string) config('ecommerce.currency', 'usd');

        $lineItems = $order->items->map(fn ($item): array => [
            'price_data' => [
                'currency' => $currency,
                'product_data' => ['name' => $item->product_name],
                'unit_amount' => (int) round((float) $item->unit_price * 100),
            ],
            'quantity' => $item->quantity,
        ])->all();

        if ((float) $order->tax > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => $currency,
                    'product_data' => ['name' => 'Tax'],
                    'unit_amount' => (int) round((float) $order->tax * 100),
                ],
                'quantity' => 1,
            ];
        }

        $session = $this->client()->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'success_url' => $this->appendSessionId((string) config('services.stripe.success_url')),
            'cancel_url' => (string) config('services.stripe.cancel_url'),
            'client_reference_id' => (string) $order->id,
            'metadata' => [
                'order_id' => (string) $order->id,
                'order_number' => $order->order_number,
            ],
            'payment_intent_data' => [
                'metadata' => ['order_id' => (string) $order->id],
            ],
        ]);

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'stripe_session_id' => $session->id,
                'status' => PaymentStatus::Pending,
                'currency' => $currency,
                'amount' => $order->total,
                'failure_reason' => null,
            ],
        );

        return new CheckoutSessionData($payment, (string) $session->url);
    }

    public function handleWebhook(string $payload, ?string $signature): void
    {
        $this->handleEvent($this->parseEvent($payload, $signature));
    }

    public function handleEvent(object $event): void
    {
        $object = $event->data->object ?? null;

        if (! is_object($object)) {
            return;
        }

        match ($event->type ?? null) {
            'checkout.session.completed' => $this->markOrderPaid($object),
            'checkout.session.expired' => $this->markPaymentFailed($object, 'Checkout session expired.'),
            'payment_intent.payment_failed' => $this->markPaymentFailed($object, 'Payment intent failed.'),
            default => null,
        };
    }

    private function markOrderPaid(object $session): void
    {
        $payment = $this->findPayment($session);

        if (! $payment instanceof Payment || $payment->status === PaymentStatus::Paid) {
            return;
        }

        DB::transaction(function () use ($payment, $session): void {
            $order = Order::query()->with('items')->lockForUpdate()->find($payment->order_id);

            if (! $order instanceof Order) {
                return;
            }

            foreach ($order->items as $item) {
                Product::query()
                    ->whereKey($item->product_id)
                    ->where('stock', '>=', $item->quantity)
                    ->decrement('stock', $item->quantity);
            }

            $order->update(['status' => OrderStatus::Paid]);

            $payment->update([
                'status' => PaymentStatus::Paid,
                'stripe_payment_intent_id' => $this->stringOrNull($session->payment_intent ?? null),
                'failure_reason' => null,
            ]);
        });
    }

    private function markPaymentFailed(object $object, string $reason): void
    {
        $payment = $this->findPayment($object);

        if (! $payment instanceof Payment || $payment->status === PaymentStatus::Paid) {
            return;
        }

        $payment->update([
            'status' => PaymentStatus::Failed,
            'failure_reason' => $reason,
        ]);
    }

    private function findPayment(object $object): ?Payment
    {
        $sessionId = $object->id ?? null;

        if (is_string($sessionId) && $sessionId !== '') {
            $payment = Payment::query()->where('stripe_session_id', $sessionId)->first();

            if ($payment instanceof Payment) {
                return $payment;
            }
        }

        $orderId = $object->metadata->order_id ?? $object->client_reference_id ?? null;

        if ($orderId !== null) {
            return Payment::query()->where('order_id', (int) $orderId)->first();
        }

        return null;
    }

    private function parseEvent(string $payload, ?string $signature): object
    {
        $secret = (string) config('services.stripe.webhook_secret');

        if ($secret !== '') {
            return Webhook::constructEvent($payload, (string) $signature, $secret);
        }

        $decoded = json_decode($payload);

        if (! is_object($decoded)) {
            throw new UnexpectedValueException('Invalid webhook payload.');
        }

        return $decoded;
    }

    private function appendSessionId(string $url): string
    {
        if ($url === '' || str_contains($url, '{CHECKOUT_SESSION_ID}')) {
            return $url;
        }

        return $url.(str_contains($url, '?') ? '&' : '?').'session_id={CHECKOUT_SESSION_ID}';
    }

    private function stringOrNull(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }

    private function client(): StripeClient
    {
        return $this->client ??= new StripeClient((string) config('services.stripe.secret'));
    }
}
