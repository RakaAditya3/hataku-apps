<?php

namespace App\Services;

use App\Models\OptionItem;
use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\Product;
use App\Models\Promo;
use App\Models\Reward;
use App\Models\TierBenefit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(private TierService $tierService) {}


    public function create(User $user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data) {
            // 1. Validate products are available
            $productIds = collect($data['items'])->pluck('product_id')->unique();
            $products = Product::whereIn('id', $productIds)
                ->where('is_available', true)
                ->where('is_deleted', false)
                ->get()
                ->keyBy('id');

            foreach ($productIds as $pid) {
                if (!$products->has($pid)) {
                    throw new \InvalidArgumentException("Produk ID {$pid} tidak tersedia");
                }
            }

            // 2. Calculate subtotal from DB prices (not from request)
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $subtotal += $products[$item['product_id']]->price * $item['quantity'];
            }

            // 3. Validate promo code
            $discountAmount = 0;
            $promoCodeUsed  = null;
            $promo          = null;

            if (!empty($data['promo_code'])) {
                $promo = Promo::where('code', $data['promo_code'])
                    ->where('is_active', true)
                    ->where('valid_from', '<=', now())
                    ->where('valid_until', '>=', now())
                    ->first();

                if (!$promo) {
                    throw new \InvalidArgumentException('Kode promo tidak valid atau sudah kadaluarsa');
                }

                if ($promo->max_uses !== null && $promo->current_uses >= $promo->max_uses) {
                    throw new \InvalidArgumentException('Kode promo sudah habis digunakan');
                }

                if ($subtotal < $promo->min_purchase) {
                    throw new \InvalidArgumentException(
                        'Minimum pembelian untuk promo ini adalah Rp ' . number_format($promo->min_purchase, 0, ',', '.')
                    );
                }

                $discountAmount = $promo->discount_type === 'fixed'
                    ? $promo->discount_value
                    : (int) floor($subtotal * $promo->discount_value / 100);

                $promoCodeUsed = $promo->code;
            }

            // 4. Validate and calculate points_to_redeem
            $pointsToRedeem = (int) ($data['points_to_redeem'] ?? 0);
            $pointsValue    = 0;

            if ($pointsToRedeem > 0) {
                $availablePoints = $user->point_balance - $user->point_reserved;

                if ($pointsToRedeem > $availablePoints) {
                    throw new \InvalidArgumentException('Point tidak mencukupi');
                }

                $pointsValue = (int) floor($pointsToRedeem / 100) * 5000;
            }

            // 5. Validate and calculate reward
            $rewardId      = $data['reward_id'] ?? null;
            $rewardDiscount = 0;

            if ($rewardId) {
                $availableAfterPoints = $user->point_balance - $user->point_reserved - $pointsToRedeem;

                $reward = Reward::with('product')
                    ->where('id', $rewardId)
                    ->where('is_active', true)
                    ->first();

                if (!$reward) {
                    throw new \InvalidArgumentException('Reward tidak ditemukan atau tidak aktif');
                }

                if ($reward->points_required > $availableAfterPoints) {
                    throw new \InvalidArgumentException('Point tidak mencukupi untuk reward ini');
                }

                if ($reward->type === 'discount') {
                    $rewardDiscount = $reward->discount_value;
                } else {
                    // Product reward: order must contain the reward product
                    $hasProduct = collect($data['items'])->contains('product_id', $reward->product_id);

                    if (!$hasProduct) {
                        throw new \InvalidArgumentException('Produk reward tidak ada di pesanan');
                    }

                    $rewardDiscount = $products[$reward->product_id]->price;
                }
            }

            // 6. Calculate final total (min 0)
            $total = max(0, $subtotal - $discountAmount - $pointsValue - $rewardDiscount);

            // 7. Generate order_code: HTK-YYYYMMDD-XXXX
            $jakarta    = Carbon::now('Asia/Jakarta');
            $dateStr    = $jakarta->format('Ymd');
            $todayCount = Order::where('order_code', 'like', "HTK-{$dateStr}-%")->count();
            $counter    = str_pad($todayCount + 1, 4, '0', STR_PAD_LEFT);
            $orderCode  = "HTK-{$dateStr}-{$counter}";

            // 8. expires_at = end of operating day in Jakarta
            $expiresAt = $jakarta->copy()->endOfDay()->utc();

            // 9. Create order record
            $order = Order::create([
                'user_id'              => $user->id,
                'order_code'           => $orderCode,
                'order_type'           => $data['order_type'],
                'status'               => 'pending',
                'subtotal'             => $subtotal,
                'discount_amount'      => $discountAmount,
                'points_redeemed'      => $pointsToRedeem,
                'points_value'         => $pointsValue,
                'reward_id'            => $rewardId,
                'reward_discount'      => $rewardDiscount,
                'total'                => $total,
                'is_valid_transaction' => $total >= 25000,
                'promo_code_used'      => $promoCodeUsed,
                'expires_at'           => $expiresAt,
            ]);

            // 10. Create order items + item options (snapshot)
            foreach ($data['items'] as $itemData) {
                $product   = $products[$itemData['product_id']];
                $orderItem = $order->items()->create([
                    'product_id'    => $product->id,
                    'product_name'  => $product->name,
                    'product_price' => $product->price,
                    'quantity'      => $itemData['quantity'],
                    'subtotal'      => $product->price * $itemData['quantity'],
                ]);

                if (!empty($itemData['selected_options'])) {
                    $optionItemIds = collect($itemData['selected_options'])->pluck('option_item_id');
                    $optionItems   = OptionItem::whereIn('id', $optionItemIds)->get()->keyBy('id');

                    foreach ($itemData['selected_options'] as $optionData) {
                        $optionItem = $optionItems->get($optionData['option_item_id']);
                        $orderItem->options()->create([
                            'option_group_id' => $optionData['option_group_id'],
                            'option_item_id'  => $optionData['option_item_id'],
                            'option_name'     => $optionItem ? $optionItem->name : '',
                        ]);
                    }
                }
            }

            // 11. Reserve points
            if ($pointsToRedeem > 0) {
                $user->increment('point_reserved', $pointsToRedeem);
            }

            // 12. Increment promo usage
            if ($promo) {
                $promo->increment('current_uses');
            }

            return $order->load(['items.options', 'user']);
        });
    }

    public function cancel(Order $order, User $user): Order
    {
        if ($order->user_id !== $user->id) {
            throw new \InvalidArgumentException('Pesanan tidak ditemukan');
        }

        if ($order->status !== 'pending') {
            throw new \InvalidArgumentException('Hanya pesanan dengan status pending yang dapat dibatalkan');
        }

        $order->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // Restore reserved points
        if ($order->points_redeemed > 0) {
            $user->decrement('point_reserved', $order->points_redeemed);
        }

        return $order->fresh(['items.options', 'user']);
    }

    public function scan(Order $order): Order
    {
        if ($order->status !== 'pending') {
            throw new \InvalidArgumentException('Hanya pesanan dengan status pending yang dapat di-scan');
        }

        return DB::transaction(function () use ($order) {
            $user = $order->user;

            $order->update([
                'status'  => 'in_progress',
                'paid_at' => now(),
            ]);

            // Deduct reserved points from balance
            if ($order->points_redeemed > 0) {
                $user->decrement('point_balance', $order->points_redeemed);
                $user->decrement('point_reserved', $order->points_redeemed);
            }

            return $order->fresh(['items.options', 'user']);
        });
    }

    public function markDone(Order $order): Order
    {
        if ($order->status !== 'in_progress') {
            throw new \InvalidArgumentException('Hanya pesanan in_progress yang dapat ditandai selesai');
        }

        return DB::transaction(function () use ($order) {
            $user = $order->user;

            // Calculate points_earned with tier bonus
            $tierBonus = TierBenefit::where('tier', $user->tier)
                ->where('benefit_type', 'point_bonus')
                ->where('is_active', true)
                ->value('bonus_percent') ?? 0;

            $basePoints   = (int) floor($order->total / 1000);
            $pointsEarned = (int) floor($basePoints * (1 + $tierBonus / 100));

            $isValid = $order->total >= 25000;

            $order->update([
                'status'               => 'done',
                'done_at'              => now(),
                'points_earned'        => $pointsEarned,
                'is_valid_transaction' => $isValid,
            ]);

            // Credit points to user
            if ($pointsEarned > 0) {
                $newBalance = $user->point_balance + $pointsEarned;
                $user->update(['point_balance' => $newBalance]);

                PointTransaction::create([
                    'user_id'       => $user->id,
                    'order_id'      => $order->id,
                    'type'          => 'earn',
                    'amount'        => $pointsEarned,
                    'balance_after' => $newBalance,
                    'note'          => "Earn dari order {$order->order_code}",
                ]);
            }

            if ($isValid) {
                $user->increment('valid_transaction_count');
                $user->refresh();
                $this->tierService->checkAndUpgrade($user);
            }

            return $order->fresh(['items.options', 'user']);
        });
    }

    public function adminCancel(Order $order): Order
    {
        $allowedStatuses = ['pending', 'paid', 'in_progress'];
        $originalStatus  = $order->status;

        if (!in_array($originalStatus, $allowedStatuses)) {
            throw new \InvalidArgumentException('Pesanan tidak dapat dibatalkan pada status ini');
        }

        return DB::transaction(function () use ($order, $originalStatus) {
            $user = $order->user;

            $order->update([
                'status'       => 'cancelled',
                'cancelled_at' => now(),
            ]);

            if ($originalStatus === 'pending' && $order->points_redeemed > 0) {
                // Points not yet deducted from balance, just release the reservation
                $user->decrement('point_reserved', $order->points_redeemed);
            } elseif (in_array($originalStatus, ['paid', 'in_progress']) && $order->points_redeemed > 0) {
                // Points were already deducted, refund to balance
                $newBalance = $user->point_balance + $order->points_redeemed;
                $user->update(['point_balance' => $newBalance]);

                PointTransaction::create([
                    'user_id'       => $user->id,
                    'order_id'      => $order->id,
                    'type'          => 'refund',
                    'amount'        => $order->points_redeemed,
                    'balance_after' => $newBalance,
                    'note'          => "Refund point dari order {$order->order_code} yang dibatalkan",
                ]);
            }

            return $order->fresh(['items.options', 'user']);
        });
    }
}
