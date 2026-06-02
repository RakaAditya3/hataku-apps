<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreatePromoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $promoId = $this->route('id');

        return [
            'title'          => 'required|string|max:100',
            'description'    => 'nullable|string',
            'banner_url'     => 'nullable|url',
            'code'           => 'nullable|string|max:50|unique:promos,code' . ($promoId ? ",{$promoId}" : ''),
            'discount_type'  => 'required|in:fixed,percent',
            'discount_value' => 'required|integer|min:1',
            'min_purchase'   => 'integer|min:0',
            'max_uses'       => 'nullable|integer|min:1',
            'valid_from'     => 'required|date',
            'valid_until'    => 'required|date|after:valid_from',
            'is_active'      => 'boolean',
        ];
    }
}
