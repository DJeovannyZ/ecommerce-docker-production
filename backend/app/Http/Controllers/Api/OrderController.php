<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::query()
            ->withCount('items')
            ->when(! $user->can('view orders'), fn ($query) => $query->where('user_id', $user->id))
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status')->toString()),
            )
            ->latest()
            ->paginate($this->perPage())
            ->withQueryString();

        return ApiResponse::collection(OrderResource::collection($orders), 'Orders list.');
    }

    public function store(CreateOrderRequest $request, OrderService $service): JsonResponse
    {
        $order = $service->create($request->user(), $request->validated('items'));

        return ApiResponse::resource(new OrderResource($order), 'Order created.', 201);
    }

    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        return ApiResponse::resource(
            new OrderResource($order->load('items')),
            'Order detail.',
        );
    }

    private function perPage(): int
    {
        $perPage = request()->integer('per_page', config('app.pagination_per_page', 15));

        return max(1, min($perPage, 100));
    }
}
