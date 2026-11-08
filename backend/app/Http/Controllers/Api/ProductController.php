<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->active()
            ->paginate($this->perPage())
            ->withQueryString();

        return ApiResponse::collection(
            ProductResource::collection($products),
            'Products list.',
        );
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        return ApiResponse::resource(
            new ProductResource($product),
            'Product created.',
            201,
        );
    }

    public function show(Product $product): JsonResponse
    {
        return ApiResponse::resource(new ProductResource($product), 'Product detail.');
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());

        return ApiResponse::resource(new ProductResource($product->fresh()), 'Product updated.');
    }

    public function destroy(Product $product): Response
    {
        abort_unless(request()->user()?->can('delete products') ?? false, 403, 'This action is unauthorized.');

        $product->delete();

        return ApiResponse::noContent();
    }

    private function perPage(): int
    {
        $perPage = request()->integer('per_page', config('app.pagination_per_page', 15));

        return max(1, min($perPage, 100));
    }
}
