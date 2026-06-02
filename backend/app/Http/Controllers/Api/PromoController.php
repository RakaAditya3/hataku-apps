<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PromoResource;
use App\Models\Promo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function index(): JsonResponse
    {
        $promos = Promo::active()->orderBy('valid_until')->get();

        return response()->json([
            'success' => true,
            'data'    => PromoResource::collection($promos),
        ]);
    }

    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code'     => 'required|string',
            'subtotal' => 'required|integer|min:0',
        ]);

        $code     = $request->input('code');
        $subtotal = (int) $request->input('subtotal');

        $promo = Promo::where('code', $code)->first();

        if (!$promo) {
            return response()->json(['success' => false, 'message' => 'Kode promo tidak ditemukan'], 404);
        }

        if (!$promo->is_active) {
            return response()->json(['success' => false, 'message' => 'Kode promo tidak aktif'], 422);
        }

        if ($promo->valid_from > now()) {
            return response()->json(['success' => false, 'message' => 'Kode promo belum berlaku'], 422);
        }

        if ($promo->valid_until < now()) {
            return response()->json(['success' => false, 'message' => 'Kode promo sudah kadaluarsa'], 422);
        }

        if ($promo->max_uses !== null && $promo->current_uses >= $promo->max_uses) {
            return response()->json(['success' => false, 'message' => 'Kode promo sudah habis digunakan'], 422);
        }

        if ($subtotal < $promo->min_purchase) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum pembelian untuk promo ini adalah Rp ' . number_format($promo->min_purchase, 0, ',', '.'),
            ], 422);
        }

        $discountAmount = $promo->discount_type === 'fixed'
            ? min($promo->discount_value, $subtotal)
            : (int) floor($subtotal * $promo->discount_value / 100);

        return response()->json([
            'success' => true,
            'data'    => [
                'code'            => $promo->code,
                'title'           => $promo->title,
                'discount_type'   => $promo->discount_type,
                'discount_value'  => $promo->discount_value,
                'discount_amount' => $discountAmount,
            ],
        ]);
    }
}
