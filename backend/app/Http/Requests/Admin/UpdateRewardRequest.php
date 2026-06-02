<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRewardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'            => ['sometimes', 'required', 'string', 'max:100'],
            'description'     => ['nullable', 'string'],
            'type'            => ['sometimes', 'required', 'in:discount,product'],
            'points_required' => ['sometimes', 'required', 'integer', 'min:1'],
            'discount_value'  => ['nullable', 'integer', 'min:1'],
            'product_id'      => ['nullable', 'exists:products,id'],
            'is_active'       => ['sometimes', 'boolean'],
        ];
    }
}
