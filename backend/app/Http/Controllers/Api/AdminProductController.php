<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\AdminProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function __construct(private ProductService $productService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'optionGroupsWithPivot.items'])
            ->where('is_deleted', false);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->input('search') . '%');
        }

        $products = $query->orderBy('sort_order')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data'    => AdminProductResource::collection($products),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'optionGroupsWithPivot.items'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => new AdminProductResource($product),
        ]);
    }

    public function store(CreateProductRequest $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Hanya admin yang dapat menambah produk'], 403);
        }

        $product = $this->productService->create($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new AdminProductResource($product),
        ], 201);
    }

    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Hanya admin yang dapat mengubah produk'], 403);
        }

        $product = Product::findOrFail($id);
        $product = $this->productService->update($product, $request->validated());

        return response()->json([
            'success' => true,
            'data'    => new AdminProductResource($product),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Hanya admin yang dapat menghapus produk'], 403);
        }

        $product = Product::where('is_deleted', false)->findOrFail($id);
        $this->productService->softDelete($product);

        return response()->json(['success' => true]);
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        $product = Product::where('is_deleted', false)->findOrFail($id);
        $product = $this->productService->toggle($product);

        return response()->json([
            'success' => true,
            'data'    => new AdminProductResource($product),
        ]);
    }
}
