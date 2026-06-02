<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreatePromoRequest;
use App\Http\Resources\AdminPromoResource;
use App\Models\Promo;
use Illuminate\Http\JsonResponse;

class AdminPromoController extends Controller
{
    public function index(): JsonResponse
    {
        $promos = Promo::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data'    => AdminPromoResource::collection($promos),
        ]);
    }

    public function store(CreatePromoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['min_purchase'] = $data['min_purchase'] ?? 0;
        $data['is_active']    = $data['is_active'] ?? true;

        $promo = Promo::create($data);

        return response()->json([
            'success' => true,
            'data'    => new AdminPromoResource($promo),
        ], 201);
    }

    public function update(CreatePromoRequest $request, int $id): JsonResponse
    {
        $promo = Promo::findOrFail($id);
        $promo->update($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new AdminPromoResource($promo->fresh()),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $promo = Promo::findOrFail($id);
        $promo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Promo berhasil dihapus',
        ]);
    }
}
