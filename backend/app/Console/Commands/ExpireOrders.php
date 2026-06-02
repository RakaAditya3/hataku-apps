<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExpireOrders extends Command
{
    protected $signature   = 'orders:expire';
    protected $description = 'Expire pending orders past their expires_at timestamp';

    public function handle(): int
    {
        $orders = Order::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->with('user')
            ->get();

        $count = 0;

        foreach ($orders as $order) {
            try {
                DB::transaction(function () use ($order) {
                    $order->update([
                        'status'       => 'expired',
                        'cancelled_at' => now(),
                    ]);

                    // Restore reserved points (balance not yet deducted for pending orders)
                    if ($order->points_redeemed > 0 && $order->user) {
                        $order->user->decrement('point_reserved', $order->points_redeemed);
                    }
                });

                $count++;
            } catch (\Throwable $e) {
                Log::error("Failed to expire order {$order->order_code}: " . $e->getMessage());
            }
        }

        if ($count > 0) {
            Log::info("Expired {$count} orders");
            $this->info("Expired {$count} orders");
        }

        return self::SUCCESS;
    }
}
