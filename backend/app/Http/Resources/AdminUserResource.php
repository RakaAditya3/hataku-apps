<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'name'                    => $this->name,
            'email'                   => $this->email,
            'phone'                   => $this->phone,
            'tier'                    => $this->tier,
            'point_balance'           => $this->point_balance,
            'valid_transaction_count' => $this->valid_transaction_count,
            'current_streak'          => $this->current_streak,
            'referral_code'           => $this->referral_code,
            'created_at'              => $this->created_at->toIso8601String(),
        ];
    }
}
