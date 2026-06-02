<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyCheckin extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id', 'checked_in_at', 'streak_day', 'points_earned',
    ];

    protected $casts = [
        'checked_in_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
