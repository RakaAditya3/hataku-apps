<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_code', 'order_type', 'status',
        'subtotal', 'discount_amount', 'points_redeemed', 'points_value',
        'reward_id', 'reward_discount', 'total',
        'points_earned', 'is_valid_transaction', 'promo_code_used',
        'expires_at', 'paid_at', 'done_at', 'cancelled_at',
    ];

    protected $casts = [
        'is_valid_transaction' => 'boolean',
        'expires_at'           => 'datetime',
        'paid_at'              => 'datetime',
        'done_at'              => 'datetime',
        'cancelled_at'         => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class);
    }
}
