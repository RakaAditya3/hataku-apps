<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                                       => ['sometimes', 'string', 'max:100'],
            'category_id'                                => ['sometimes', 'integer', 'exists:categories,id'],
            'description'                                => ['nullable', 'string'],
            'price'                                      => ['sometimes', 'integer', 'min:1'],
            'photo_url'                                  => ['nullable', 'url'],
            'is_available'                               => ['sometimes', 'boolean'],
            'sort_order'                                 => ['sometimes', 'integer'],
            'option_group_ids'                           => ['nullable', 'array'],
            'option_group_ids.*'                         => ['integer', 'exists:option_groups,id'],
            'option_group_overrides'                     => ['nullable', 'array'],
            'option_group_overrides.*.option_group_id'   => ['required_with:option_group_overrides', 'integer', 'exists:option_groups,id'],
            'option_group_overrides.*.min_select'        => ['required_with:option_group_overrides', 'integer', 'min:1'],
            'option_group_overrides.*.max_select'        => ['required_with:option_group_overrides', 'integer', 'min:1'],
        ];
    }
}
