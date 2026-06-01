<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                   => $this->id,
            'order_code'           => $this->order_code,
            'order_type'           => $this->order_type,
            'status'               => $this->status,
            'subtotal'             => $this->subtotal,
            'discount_amount'      => $this->discount_amount,
            'points_redeemed'      => $this->points_redeemed,
            'points_value'         => $this->points_value,
            'reward_discount'      => $this->reward_discount,
            'total'                => $this->total,
            'points_earned'        => $this->points_earned,
            'is_valid_transaction' => $this->is_valid_transaction,
            'promo_code_used'      => $this->promo_code_used,
            'expires_at'           => $this->expires_at?->toIso8601String(),
            'paid_at'              => $this->paid_at?->toIso8601String(),
            'done_at'              => $this->done_at?->toIso8601String(),
            'cancelled_at'         => $this->cancelled_at?->toIso8601String(),
            'created_at'           => $this->created_at->toIso8601String(),
            'user'                 => $this->whenLoaded('user', fn () => ['name' => $this->user->name]),
            'items'                => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
