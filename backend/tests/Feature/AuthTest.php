<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function registerPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ], $overrides);
}

it('registers a user and returns a token with the customer role', function () {
    $response = $this->postJson('/api/v1/auth/register', registerPayload());

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.token_type', 'bearer')
        ->assertJsonPath('data.user.email', 'jane@example.com')
        ->assertJsonPath('data.user.roles', ['customer']);

    $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
});

it('rejects registration with a duplicate email', function () {
    User::factory()->create(['email' => 'jane@example.com']);

    $this->postJson('/api/v1/auth/register', registerPayload())
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('rejects registration when the password confirmation does not match', function () {
    $this->postJson('/api/v1/auth/register', registerPayload(['password_confirmation' => 'different']))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

it('logs in with valid credentials', function () {
    User::factory()->create(['email' => 'jane@example.com', 'password' => 'password123']);

    $this->postJson('/api/v1/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'password123',
    ])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['access_token', 'token_type', 'expires_in']]);
});

it('rejects invalid credentials', function () {
    User::factory()->create(['email' => 'jane@example.com', 'password' => 'password123']);

    $this->postJson('/api/v1/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'wrong-password',
    ])
        ->assertUnauthorized()
        ->assertJsonPath('code', 'INVALID_CREDENTIALS');
});

it('returns the authenticated user', function () {
    $user = User::factory()->create();
    $token = auth('api')->login($user);

    $this->withToken($token)
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', $user->email);
});

it('rejects unauthenticated access to protected routes', function () {
    $this->getJson('/api/v1/auth/me')
        ->assertUnauthorized()
        ->assertJsonPath('code', 'UNAUTHENTICATED');
});

it('invalidates the token on logout', function () {
    $user = User::factory()->create();
    $token = auth('api')->login($user);

    $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();

    $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
});

it('refreshes a token', function () {
    $user = User::factory()->create();
    $token = auth('api')->login($user);

    $this->withToken($token)
        ->postJson('/api/v1/auth/refresh')
        ->assertOk()
        ->assertJsonStructure(['data' => ['access_token', 'token_type']]);
});
