<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'description', 'price',
        'photo_url', 'is_available', 'daily_stock_limit',
        'sort_order', 'is_deleted',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'is_deleted'   => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function productOptionGroups(): HasMany
    {
        return $this->hasMany(ProductOptionGroup::class);
    }

    public function optionGroupsWithPivot(): BelongsToMany
    {
        return $this->belongsToMany(OptionGroup::class, 'product_option_groups')
            ->withPivot('min_select', 'max_select');
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_available', true)->where('is_deleted', false);
    }
}
