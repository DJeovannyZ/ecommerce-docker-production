<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

pest()->extend(TestCase::class)
    ->in('Unit');

function adminUser(): User
{
    return User::factory()->create()->assignRole('admin');
}

function customerUser(): User
{
    return User::factory()->create()->assignRole('customer');
}
