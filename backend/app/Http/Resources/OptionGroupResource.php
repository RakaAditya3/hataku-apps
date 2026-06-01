<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OptionGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'is_required' => $this->is_required,
            'min_select'  => $this->pivot?->min_select ?? $this->min_select,
            'max_select'  => $this->pivot?->max_select ?? $this->max_select,
            'items'       => OptionItemResource::collection(
                $this->items->where('is_active', true)->values()
            ),
        ];
    }
}
