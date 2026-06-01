<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OptionGroup extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'is_required', 'min_select', 'max_select'];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OptionItem::class)->orderBy('sort_order');
    }

    public function productOptionGroups(): HasMany
    {
        return $this->hasMany(ProductOptionGroup::class);
    }
}
