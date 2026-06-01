<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\AdminCategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')
            ->where('is_deleted', false)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => AdminCategoryResource::collection($categories),
        ]);
    }

    public function store(CreateCategoryRequest $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Hanya admin yang dapat menambah kategori'], 403);
        }

        $category = Category::create($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new AdminCategoryResource($category),
        ], 201);
    }

    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Hanya admin yang dapat mengubah kategori'], 403);
        }

        $category = Category::where('is_deleted', false)->findOrFail($id);
        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new AdminCategoryResource($category),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Hanya admin yang dapat menghapus kategori'], 403);
        }

        $category = Category::where('is_deleted', false)->findOrFail($id);

        if ($category->products()->where('is_deleted', false)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak dapat dihapus karena masih memiliki produk aktif',
            ], 400);
        }

        $category->update(['is_deleted' => true, 'is_active' => false]);

        return response()->json(['success' => true]);
    }
}
