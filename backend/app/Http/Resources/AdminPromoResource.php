<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminPromoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'description'   => $this->description,
            'banner_url'    => $this->banner_url,
            'code'          => $this->code,
            'discount_type' => $this->discount_type,
            'discount_value'=> $this->discount_value,
            'min_purchase'  => $this->min_purchase,
            'max_uses'      => $this->max_uses,
            'current_uses'  => $this->current_uses,
            'valid_from'    => $this->valid_from?->toIso8601String(),
            'valid_until'   => $this->valid_until?->toIso8601String(),
            'is_active'     => $this->is_active,
            'created_at'    => $this->created_at?->toIso8601String(),
        ];
    }
}
