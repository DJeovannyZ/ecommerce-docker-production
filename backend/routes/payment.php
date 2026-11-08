<?php

use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\PaymentController;
use Illuminate\Support\Facades\Route;

Route::post('payments/webhook', [PaymentController::class, 'webhook']);

Route::middleware('auth:api')->group(function () {
    Route::post('orders/{order}/checkout', [CheckoutController::class, 'store']);
    Route::get('orders/{order}/payment', [PaymentController::class, 'show']);
});
