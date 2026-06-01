<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'google_id',
        'avatar_url',
        'point_balance',
        'point_reserved',
        'tier',
        'valid_transaction_count',
        'current_streak',
        'last_checkin_date',
        'streak_started_at',
        'referral_code',
        'referred_by_user_id',
        'referral_bonus_given',
        'last_weekly_voucher_at',
        'last_monthly_voucher_at',
    ];

    protected $hidden = [
        'google_id',
        'point_reserved',
        'referral_bonus_given',
        'referred_by_user_id',
        'last_weekly_voucher_at',
        'last_monthly_voucher_at',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function pointTransactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class);
    }

    protected function casts(): array
    {
        return [
            'referral_bonus_given' => 'boolean',
            'last_checkin_date'    => 'date',
            'streak_started_at'    => 'date',
            'last_weekly_voucher_at'  => 'date',
            'last_monthly_voucher_at' => 'date',
        ];
    }
}
