<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                                       => ['required', 'string', 'max:100'],
            'category_id'                                => ['required', 'integer', 'exists:categories,id'],
            'description'                                => ['nullable', 'string'],
            'price'                                      => ['required', 'integer', 'min:1'],
            'photo_url'                                  => ['nullable', 'url'],
            'is_available'                               => ['boolean'],
            'sort_order'                                 => ['integer'],
            'option_group_ids'                           => ['nullable', 'array'],
            'option_group_ids.*'                         => ['integer', 'exists:option_groups,id'],
            'option_group_overrides'                     => ['nullable', 'array'],
            'option_group_overrides.*.option_group_id'   => ['required', 'integer', 'exists:option_groups,id'],
            'option_group_overrides.*.min_select'        => ['required', 'integer', 'min:1'],
            'option_group_overrides.*.max_select'        => ['required', 'integer', 'min:1'],
        ];
    }
}
