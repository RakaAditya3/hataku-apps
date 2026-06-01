<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PointTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'type'          => $this->type,
            'amount'        => $this->amount,
            'balance_after' => $this->balance_after,
            'note'          => $this->note,
            'order_code'    => $this->whenLoaded('order', fn () => $this->order?->order_code),
            'created_at'    => $this->created_at->toIso8601String(),
        ];
    }
}
