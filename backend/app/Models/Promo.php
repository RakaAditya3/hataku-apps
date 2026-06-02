<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    protected $fillable = [
        'title', 'description', 'banner_url', 'code',
        'discount_type', 'discount_value', 'min_purchase',
        'max_uses', 'current_uses', 'valid_from', 'valid_until', 'is_active',
    ];

    protected $casts = [
        'is_active'   => 'boolean',
        'valid_from'  => 'datetime',
        'valid_until' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('valid_from', '<=', now())
            ->where('valid_until', '>=', now());
    }

    public function scopeWithCode($query)
    {
        return $query->whereNotNull('code');
    }
}
