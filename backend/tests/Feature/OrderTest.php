<?php

use App\Models\Order;
use App\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

it('requires authentication to create an order', function () {
    $this->postJson('/api/v1/orders', ['items' => []])
        ->assertUnauthorized();
});

it('creates an order and computes totals from the catalog', function () {
    $first = Product::factory()->create(['price' => 10.00, 'stock' => 5]);
    $second = Product::factory()->create(['price' => 25.50, 'stock' => 5]);

    $response = $this->actingAs(customerUser(), 'api')
        ->postJson('/api/v1/orders', [
            'items' => [
                ['product_id' => $first->id, 'quantity' => 2],
                ['product_id' => $second->id, 'quantity' => 1],
            ],
        ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.subtotal', 45.5)
        ->assertJsonPath('data.total', 45.5)
        ->assertJsonCount(2, 'data.items');

    $this->assertDatabaseCount('orders', 1);
    $this->assertDatabaseCount('order_items', 2);
    $this->assertDatabaseHas('orders', ['subtotal' => 45.50, 'total' => 45.50, 'status' => 'pending']);
});

it('rejects an order without items', function () {
    $this->actingAs(customerUser(), 'api')
        ->postJson('/api/v1/orders', ['items' => []])
        ->assertStatus(422)
        ->assertJsonPath('code', 'VALIDATION_ERROR')
        ->assertJsonValidationErrors(['items']);
});

it('rejects unknown products', function () {
    $this->actingAs(customerUser(), 'api')
        ->postJson('/api/v1/orders', [
            'items' => [['product_id' => 999999, 'quantity' => 1]],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['items.0.product_id']);
});

it('rejects orders with insufficient stock', function () {
    $product = Product::factory()->create(['stock' => 1]);

    $this->actingAs(customerUser(), 'api')
        ->postJson('/api/v1/orders', [
            'items' => [['product_id' => $product->id, 'quantity' => 5]],
        ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'INSUFFICIENT_STOCK');

    $this->assertDatabaseCount('orders', 0);
});

it('rejects inactive products', function () {
    $product = Product::factory()->inactive()->create(['stock' => 10]);

    $this->actingAs(customerUser(), 'api')
        ->postJson('/api/v1/orders', [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'PRODUCT_UNAVAILABLE');
});

it('lists only the authenticated user orders', function () {
    $customer = customerUser();
    Order::factory()->count(2)->create(['user_id' => $customer->id]);
    Order::factory()->create();

    $this->actingAs($customer, 'api')
        ->getJson('/api/v1/orders')
        ->assertOk()
        ->assertJsonPath('meta.total', 2);
});

it('lets admins list every order', function () {
    Order::factory()->count(3)->create();

    $this->actingAs(adminUser(), 'api')
        ->getJson('/api/v1/orders')
        ->assertOk()
        ->assertJsonPath('meta.total', 3);
});

it('prevents customers from viewing another user order', function () {
    $order = Order::factory()->create();

    $this->actingAs(customerUser(), 'api')
        ->getJson("/api/v1/orders/{$order->id}")
        ->assertForbidden()
        ->assertJsonPath('code', 'FORBIDDEN');
});

it('lets owners view their own order', function () {
    $customer = customerUser();
    $order = Order::factory()->create(['user_id' => $customer->id]);

    $this->actingAs($customer, 'api')
        ->getJson("/api/v1/orders/{$order->id}")
        ->assertOk()
        ->assertJsonPath('data.order_number', $order->order_number);
});
