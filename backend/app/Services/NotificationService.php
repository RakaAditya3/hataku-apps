<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function sendWhatsApp(string $message): bool
    {
        $apiKey = config('services.fonnte.api_key');
        $target = config('services.fonnte.target_number');

        if (empty($apiKey) || empty($target)) {
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $apiKey,
            ])->post('https://api.fonnte.com/send', [
                'target'  => $target,
                'message' => $message,
            ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::warning('WhatsApp notification failed: ' . $e->getMessage());
            return false;
        }
    }

    public function notifyNewOrder(Order $order): void
    {
        $message = "Pesanan Baru!\n"
            . "Kode: {$order->order_code}\n"
            . "Tipe: " . ($order->order_type === 'dine_in' ? 'Dine In' : 'Take Away') . "\n"
            . "Total: Rp " . number_format($order->total, 0, ',', '.') . "\n"
            . "Items: " . $order->items->count() . " item\n"
            . "Waktu: " . now()->timezone('Asia/Jakarta')->format('H:i');

        $this->sendWhatsApp($message);
    }
}
