<?php

use App\Support\ApiResponse;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ApiResponse::success([
        'name' => config('app.name'),
        'version' => 'v1',
        'documentation' => url('/api/documentation'),
    ], 'E-commerce API');
});

Route::prefix('v1')->group(function () {
    require __DIR__.'/auth.php';
    require __DIR__.'/product.php';
    require __DIR__.'/order.php';
    require __DIR__.'/payment.php';
});
