<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'sort_order'     => $this->sort_order,
            'is_active'      => $this->is_active,
            'is_deleted'     => $this->is_deleted,
            'products_count' => $this->whenCounted('products'),
        ];
    }
}
