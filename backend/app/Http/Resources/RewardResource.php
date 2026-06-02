<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RewardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'description'     => $this->description,
            'type'            => $this->type,
            'points_required' => $this->points_required,
            'discount_value'  => $this->discount_value,
            'is_active'       => $this->is_active,
            'product'         => $this->when(
                $this->type === 'product' && $this->relationLoaded('product') && $this->product,
                fn () => [
                    'id'    => $this->product->id,
                    'name'  => $this->product->name,
                    'price' => $this->product->price,
                ]
            ),
        ];
    }
}
