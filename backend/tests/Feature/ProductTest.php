<?php

use App\Models\Product;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

it('lists active products publicly with pagination', function () {
    Product::factory()->count(3)->create();
    Product::factory()->inactive()->create();

    $response = $this->getJson('/api/v1/products');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('meta.total', 3)
        ->assertJsonCount(3, 'data');
});

it('shows a single product publicly', function () {
    $product = Product::factory()->create(['name' => 'Gaming Mouse']);

    $this->getJson("/api/v1/products/{$product->id}")
        ->assertOk()
        ->assertJsonPath('data.name', 'Gaming Mouse')
        ->assertJsonPath('data.price', (float) $product->price);
});

it('returns not found for a missing product', function () {
    $this->getJson('/api/v1/products/999999')
        ->assertNotFound()
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'NOT_FOUND');
});

it('requires authentication to create products', function () {
    $payload = ['name' => 'New Product', 'price' => 10, 'stock' => 5];

    $this->postJson('/api/v1/products', $payload)
        ->assertUnauthorized()
        ->assertJsonPath('code', 'UNAUTHENTICATED');
});

it('forbids customers from creating products', function () {
    $payload = ['name' => 'New Product', 'price' => 10, 'stock' => 5];

    $this->actingAs(customerUser(), 'api')
        ->postJson('/api/v1/products', $payload)
        ->assertForbidden()
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'FORBIDDEN');
});

it('allows admins to create products', function () {
    $payload = ['name' => 'New Product', 'price' => 10.5, 'stock' => 5];

    $this->actingAs(adminUser(), 'api')
        ->postJson('/api/v1/products', $payload)
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.name', 'New Product')
        ->assertJsonPath('data.slug', 'new-product');

    $this->assertDatabaseHas('products', ['name' => 'New Product']);
});

it('validates the product payload', function () {
    $this->actingAs(adminUser(), 'api')
        ->postJson('/api/v1/products', ['price' => -1])
        ->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'VALIDATION_ERROR')
        ->assertJsonValidationErrors(['name', 'price', 'stock']);
});

it('allows admins to update products', function () {
    $product = Product::factory()->create();

    $this->actingAs(adminUser(), 'api')
        ->putJson("/api/v1/products/{$product->id}", ['price' => 99.99])
        ->assertOk()
        ->assertJsonPath('data.price', 99.99);
});

it('allows admins to delete products', function () {
    $product = Product::factory()->create();

    $this->actingAs(adminUser(), 'api')
        ->deleteJson("/api/v1/products/{$product->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

it('prevents customers from deleting products', function () {
    $product = Product::factory()->create();

    $this->actingAs(customerUser(), 'api')
        ->deleteJson("/api/v1/products/{$product->id}")
        ->assertForbidden()
        ->assertJsonPath('code', 'FORBIDDEN');
});
