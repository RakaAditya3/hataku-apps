<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(CreateOrderRequest $request, OrderService $orderService)
    {
        try {
            $order = $orderService->create($request->user(), $request->validated());

            return response()->json([
                'success' => true,
                'data'    => new OrderResource($order),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.options'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

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

    public function show(Request $request, string $code)
    {
        $order = Order::where('order_code', $code)
            ->where('user_id', $request->user()->id)
            ->with(['items.options', 'user'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
        ]);
    }

    public function cancel(Request $request, string $code, OrderService $orderService)
    {
        $order = Order::where('order_code', $code)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        try {
            $order = $orderService->cancel($order, $request->user());

            return response()->json([
                'success' => true,
                'data'    => new OrderResource($order),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
