<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'description'       => $this->description,
            'price'             => $this->price,
            'photo_url'         => $this->photo_url,
            'is_available'      => $this->is_available,
            'is_deleted'        => $this->is_deleted,
            'sort_order'        => $this->sort_order,
            'daily_stock_limit' => $this->daily_stock_limit,
            'category'          => new CategoryResource($this->whenLoaded('category')),
            'option_groups'     => AdminOptionGroupResource::collection(
                $this->whenLoaded('optionGroupsWithPivot')
            ),
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
        ];
    }
}
