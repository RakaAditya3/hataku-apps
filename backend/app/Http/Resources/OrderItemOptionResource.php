<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemOptionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'option_group_id' => $this->option_group_id,
            'option_item_id'  => $this->option_item_id,
            'option_name'     => $this->option_name,
        ];
    }
}
