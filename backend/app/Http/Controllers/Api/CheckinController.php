<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckinService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckinController extends Controller
{
    public function __construct(private CheckinService $checkinService) {}

    public function checkin(Request $request): JsonResponse
    {
        try {
            $result = $this->checkinService->checkin($request->user());

            return response()->json([
                'success' => true,
                'data'    => $result,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function status(Request $request): JsonResponse
    {
        $result = $this->checkinService->status($request->user());

        return response()->json([
            'success' => true,
            'data'    => $result,
        ]);
    }
}
