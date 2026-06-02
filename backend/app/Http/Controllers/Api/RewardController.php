<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RewardResource;
use App\Models\Reward;
use Illuminate\Http\JsonResponse;

class RewardController extends Controller
{
    public function index(): JsonResponse
    {
        $rewards = Reward::with('product')
            ->where('is_active', true)
            ->orderBy('points_required')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => RewardResource::collection($rewards),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $reward = Reward::with('product')
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => new RewardResource($reward),
        ]);
    }
}
