<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::available()
            ->with(['category', 'optionGroupsWithPivot.items'])
            ->orderBy('sort_order');

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->query('category_id'));
        }

        return response()->json([
            'success' => true,
            'data'    => ProductResource::collection($query->get()),
        ]);
    }

    public function show(int $id)
    {
        $product = Product::available()
            ->with(['category', 'optionGroupsWithPivot.items'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => new ProductResource($product),
        ]);
    }
}
