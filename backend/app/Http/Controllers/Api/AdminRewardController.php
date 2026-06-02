<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateRewardRequest;
use App\Http\Requests\Admin\UpdateRewardRequest;
use App\Http\Resources\RewardResource;
use App\Models\Reward;
use Illuminate\Http\JsonResponse;

class AdminRewardController extends Controller
{
    public function index(): JsonResponse
    {
        $rewards = Reward::with('product')
            ->orderBy('points_required')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => RewardResource::collection($rewards),
        ]);
    }

    public function store(CreateRewardRequest $request): JsonResponse
    {
        $reward = Reward::create($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new RewardResource($reward->load('product')),
        ], 201);
    }

    public function update(UpdateRewardRequest $request, int $id): JsonResponse
    {
        $reward = Reward::findOrFail($id);
        $reward->update($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new RewardResource($reward->load('product')),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $reward = Reward::findOrFail($id);
        $reward->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Reward berhasil dinonaktifkan',
        ]);
    }
}
