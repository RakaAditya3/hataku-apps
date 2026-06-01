<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_type'                                      => ['required', 'in:dine_in,takeaway'],
            'items'                                           => ['required', 'array', 'min:1'],
            'items.*.product_id'                              => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'                                => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.selected_options'                        => ['required', 'array'],
            'items.*.selected_options.*.option_group_id'      => ['required', 'integer', 'exists:option_groups,id'],
            'items.*.selected_options.*.option_item_id'       => ['required', 'integer', 'exists:option_items,id'],
            'promo_code'                                      => ['nullable', 'string'],
            'points_to_redeem'                                => ['nullable', 'integer', 'min:0'],
            'reward_id'                                       => ['nullable', 'integer', 'exists:rewards,id'],
        ];
    }
}
