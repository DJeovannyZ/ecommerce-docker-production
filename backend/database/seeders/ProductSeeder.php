<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    private const PRODUCTS = [
        ['name' => 'Wireless Headphones', 'price' => 89.99, 'stock' => 50],
        ['name' => 'Mechanical Keyboard', 'price' => 129.99, 'stock' => 30],
        ['name' => '4K Monitor', 'price' => 349.99, 'stock' => 15],
        ['name' => 'USB-C Hub', 'price' => 49.99, 'stock' => 80],
        ['name' => 'Webcam 1080p', 'price' => 69.99, 'stock' => 25],
        ['name' => 'Bluetooth Speaker', 'price' => 39.99, 'stock' => 60],
        ['name' => 'Smart Watch', 'price' => 199.99, 'stock' => 20],
        ['name' => 'Laptop Stand', 'price' => 29.99, 'stock' => 100],
        ['name' => 'Ergonomic Mouse', 'price' => 24.99, 'stock' => 45],
        ['name' => 'Gaming Headset', 'price' => 79.99, 'stock' => 0],
    ];

    public function run(): void
    {
        foreach (self::PRODUCTS as $product) {
            Product::firstOrCreate(
                ['slug' => Str::slug($product['name'])],
                [
                    'name' => $product['name'],
                    'description' => "High quality {$product['name']} for your daily needs.",
                    'price' => $product['price'],
                    'stock' => $product['stock'],
                    'image_url' => null,
                    'is_active' => true,
                ],
            );
        }
    }
}
