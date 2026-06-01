<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items.options', 'user'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => OrderResource::collection($orders->items()),
            'meta'    => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    public function show(string $code): JsonResponse
    {
        $order = Order::with(['items.options', 'user'])
            ->where('order_code', $code)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
        ]);
    }

    public function scan(string $code): JsonResponse
    {
        $order = Order::with(['items.options', 'user'])
            ->where('order_code', $code)
            ->firstOrFail();

        try {
            $order = $this->orderService->scan($order);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
        ]);
    }

    public function done(string $code): JsonResponse
    {
        $order = Order::with(['items.options', 'user'])
            ->where('order_code', $code)
            ->firstOrFail();

        try {
            $order = $this->orderService->markDone($order);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
        ]);
    }

    public function cancel(Request $request, string $code): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat membatalkan pesanan',
            ], 403);
        }

        $order = Order::with(['items.options', 'user'])
            ->where('order_code', $code)
            ->firstOrFail();

        try {
            $order = $this->orderService->adminCancel($order);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
        ]);
    }
}
