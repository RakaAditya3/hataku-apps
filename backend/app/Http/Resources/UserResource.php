<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'name'                    => $this->name,
            'email'                   => $this->email,
            'phone'                   => $this->phone,
            'avatar_url'              => $this->avatar_url,
            'tier'                    => $this->tier,
            'point_balance'           => $this->point_balance,
            'valid_transaction_count' => $this->valid_transaction_count,
            'current_streak'          => $this->current_streak,
            'referral_code'           => $this->referral_code,
            'created_at'              => $this->created_at,
        ];
    }
}
