<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateRewardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'            => ['required', 'string', 'max:100'],
            'description'     => ['nullable', 'string'],
            'type'            => ['required', 'in:discount,product'],
            'points_required' => ['required', 'integer', 'min:1'],
            'discount_value'  => ['required_if:type,discount', 'nullable', 'integer', 'min:1'],
            'product_id'      => ['required_if:type,product', 'nullable', 'exists:products,id'],
        ];
    }
}
