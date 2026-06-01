<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminCustomerDetailResource;
use App\Http\Resources\AdminUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('tier')) {
            $query->where('tier', $request->input('tier'));
        }

        $customers = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => AdminUserResource::collection($customers),
            'meta'    => [
                'current_page' => $customers->currentPage(),
                'last_page'    => $customers->lastPage(),
                'total'        => $customers->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with([
            'orders'            => fn ($q) => $q->latest()->limit(5)->with('items'),
            'pointTransactions' => fn ($q) => $q->latest()->limit(10)->with('order'),
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => new AdminCustomerDetailResource($user),
        ]);
    }
}
