<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'stripe_session_id' => 'cs_test_'.Str::random(16),
            'stripe_payment_intent_id' => null,
            'status' => PaymentStatus::Pending,
            'currency' => 'usd',
            'amount' => fake()->randomFloat(2, 1, 500),
            'failure_reason' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Paid,
            'stripe_payment_intent_id' => 'pi_test_'.Str::random(16),
        ]);
    }
}
