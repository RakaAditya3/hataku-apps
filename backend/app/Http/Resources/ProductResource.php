<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'description'   => $this->description,
            'price'         => $this->price,
            'photo_url'     => $this->photo_url,
            'is_available'  => $this->is_available,
            'category'      => new CategoryResource($this->whenLoaded('category')),
            'option_groups' => OptionGroupResource::collection(
                $this->whenLoaded('optionGroupsWithPivot')
            ),
        ];
    }
}
