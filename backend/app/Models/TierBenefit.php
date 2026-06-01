<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TierBenefit extends Model
{
    protected $fillable = [
        'tier', 'benefit_type', 'bonus_percent',
        'voucher_value', 'voucher_type', 'description', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
