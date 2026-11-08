<?php

use App\Data\CheckoutSessionData;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Services\StripePaymentService;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    config([
        'services.stripe.webhook_secret' => null,
        'ecommerce.currency' => 'usd',
    ]);
});

it('requires authentication to start a checkout', function () {
    $order = Order::factory()->create();

    $this->postJson("/api/v1/orders/{$order->id}/checkout")
        ->assertUnauthorized();
});

it('forbids starting checkout for another user order', function () {
    $order = Order::factory()->create();

    $this->actingAs(customerUser(), 'api')
        ->postJson("/api/v1/orders/{$order->id}/checkout")
        ->assertForbidden();
});

it('creates a checkout session for a pending order', function () {
    $customer = customerUser();
    $order = Order::factory()->create(['user_id' => $customer->id]);
    $payment = Payment::factory()->create(['order_id' => $order->id]);

    $this->mock(StripePaymentService::class, function ($mock) use ($payment) {
        $mock->shouldReceive('createCheckoutSession')
            ->once()
            ->andReturn(new CheckoutSessionData($payment, 'https://checkout.stripe.test/session'));
    });

    $this->actingAs($customer, 'api')
        ->postJson("/api/v1/orders/{$order->id}/checkout")
        ->assertOk()
        ->assertJsonPath('data.checkout_url', 'https://checkout.stripe.test/session')
        ->assertJsonPath('data.payment.id', $payment->id);
});

it('rejects checkout for an order that is not pending', function () {
    $customer = customerUser();
    $order = Order::factory()->create(['user_id' => $customer->id, 'status' => 'paid']);

    $this->actingAs($customer, 'api')
        ->postJson("/api/v1/orders/{$order->id}/checkout")
        ->assertStatus(409)
        ->assertJsonPath('code', 'ORDER_NOT_PAYABLE');
});

it('marks order and payment as paid and reduces stock on completed checkout', function () {
    $product = Product::factory()->create(['stock' => 10]);
    $order = Order::factory()->create(['status' => 'pending']);
    $order->items()->create([
        'product_id' => $product->id,
        'product_name' => $product->name,
        'unit_price' => $product->price,
        'quantity' => 2,
        'line_total' => (float) $product->price * 2,
    ]);
    $payment = Payment::factory()->create([
        'order_id' => $order->id,
        'status' => 'pending',
        'stripe_session_id' => 'cs_test_paid',
    ]);

    $this->postJson('/api/v1/payments/webhook', [
        'id' => 'evt_test',
        'type' => 'checkout.session.completed',
        'data' => [
            'object' => [
                'id' => 'cs_test_paid',
                'payment_intent' => 'pi_test_paid',
                'metadata' => ['order_id' => (string) $order->id],
            ],
        ],
    ])->assertOk();

    expect($order->fresh()->status->value)->toBe('paid')
        ->and($payment->fresh()->status->value)->toBe('paid')
        ->and($product->fresh()->stock)->toBe(8);
});

it('marks the payment as failed when the checkout session expires', function () {
    $order = Order::factory()->create();
    $payment = Payment::factory()->create([
        'order_id' => $order->id,
        'status' => 'pending',
        'stripe_session_id' => 'cs_test_expired',
    ]);

    $this->postJson('/api/v1/payments/webhook', [
        'id' => 'evt_test_expired',
        'type' => 'checkout.session.expired',
        'data' => ['object' => ['id' => 'cs_test_expired']],
    ])->assertOk();

    expect($payment->fresh()->status->value)->toBe('failed');
});

it('rejects an invalid webhook payload', function () {
    $this->call('POST', '/api/v1/payments/webhook', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_ACCEPT' => 'application/json',
    ], 'not-json')->assertStatus(400)
        ->assertJsonPath('code', 'INVALID_PAYLOAD');
});

it('shows the payment of an order to its owner', function () {
    $customer = customerUser();
    $order = Order::factory()->create(['user_id' => $customer->id]);
    $payment = Payment::factory()->paid()->create(['order_id' => $order->id]);

    $this->actingAs($customer, 'api')
        ->getJson("/api/v1/orders/{$order->id}/payment")
        ->assertOk()
        ->assertJsonPath('data.id', $payment->id)
        ->assertJsonPath('data.status', 'paid');
});
