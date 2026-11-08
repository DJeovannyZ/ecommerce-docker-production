<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\ProductUnavailableException;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    /**
     * @param  array<int, array{product_id: int, quantity: int}>  $items
     */
    public function create(User $user, array $items): Order
    {
        return DB::transaction(function () use ($user, $items): Order {
            $products = Product::query()
                ->whereIn('id', collect($items)->pluck('product_id')->all())
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0.0;
            $lines = [];

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);

                if (! $product instanceof Product || ! $product->is_active) {
                    throw new ProductUnavailableException((int) $item['product_id']);
                }

                $quantity = (int) $item['quantity'];

                if (! $product->isInStock($quantity)) {
                    throw new InsufficientStockException($product->id, $quantity, $product->stock);
                }

                $lineTotal = round((float) $product->price * $quantity, 2);
                $subtotal += $lineTotal;

                $lines[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                ];
            }

            $tax = round($subtotal * (float) config('ecommerce.tax_rate', 0), 2);
            $total = round($subtotal + $tax, 2);

            $order = $user->orders()->create([
                'order_number' => $this->generateOrderNumber(),
                'status' => OrderStatus::Pending,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
            ]);

            $order->items()->createMany($lines);

            return $order->load('items');
        });
    }

    private function generateOrderNumber(): string
    {
        $prefix = (string) config('ecommerce.order_prefix', 'ORD');

        do {
            $number = $prefix.'-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }
}
