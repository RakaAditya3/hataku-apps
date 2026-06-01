<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function googleLogin(Request $request): JsonResponse
    {
        $request->validate([
            'google_id'  => ['required', 'string'],
            'email'      => ['required', 'email'],
            'name'       => ['required', 'string'],
            'avatar_url' => ['nullable', 'string'],
        ]);

        $user  = $this->authService->findOrCreateUser($request->only('google_id', 'email', 'name', 'avatar_url'));
        $token = $user->createToken('customer')->plainTextToken;

        return response()->json([
            'success' => true,
            'data'    => [
                'user'  => new UserResource($user),
                'token' => $token,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => new UserResource($request->user()),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new UserResource($user->fresh()),
        ]);
    }
}
