<?php

namespace App\Services;

use App\Models\DailyCheckin;
use App\Models\PointTransaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CheckinService
{
    public function checkin(User $user): array
    {
        return DB::transaction(function () use ($user) {
            $today = Carbon::now('Asia/Jakarta')->toDateString();

            if ($user->last_checkin_date && $user->last_checkin_date->toDateString() === $today) {
                throw new \InvalidArgumentException('Sudah check-in hari ini');
            }

            // Calculate new streak day
            if ($user->current_streak >= 7) {
                $streakDay       = 1;
                $streakStartedAt = $today;
            } else {
                $streakDay       = $user->current_streak + 1;
                $streakStartedAt = $streakDay === 1 ? $today : $user->streak_started_at?->toDateString();
            }

            $pointsEarned = ($streakDay === 7) ? 5 : 1;
            $newBalance   = $user->point_balance + $pointsEarned;

            $user->update([
                'current_streak'    => $streakDay,
                'last_checkin_date' => $today,
                'streak_started_at' => $streakStartedAt,
                'point_balance'     => $newBalance,
            ]);

            DailyCheckin::create([
                'user_id'       => $user->id,
                'checked_in_at' => $today,
                'streak_day'    => $streakDay,
                'points_earned' => $pointsEarned,
            ]);

            PointTransaction::create([
                'user_id'       => $user->id,
                'order_id'      => null,
                'type'          => 'checkin',
                'amount'        => $pointsEarned,
                'balance_after' => $newBalance,
                'note'          => "Check-in hari ke-{$streakDay}",
            ]);

            return [
                'streak_day'    => $streakDay,
                'points_earned' => $pointsEarned,
                'point_balance' => $newBalance,
                'is_bonus_day'  => $streakDay === 7,
            ];
        });
    }

    public function status(User $user): array
    {
        $today              = Carbon::now('Asia/Jakarta')->toDateString();
        $alreadyCheckedIn   = $user->last_checkin_date && $user->last_checkin_date->toDateString() === $today;

        if ($alreadyCheckedIn) {
            $nextStreakDay = $user->current_streak;
        } else {
            $nextStreakDay = $user->current_streak >= 7 ? 1 : $user->current_streak + 1;
        }

        $nextPoints = ($nextStreakDay === 7) ? 5 : 1;

        return [
            'current_streak'         => $user->current_streak,
            'last_checkin_date'      => $user->last_checkin_date?->toDateString(),
            'already_checked_in'     => $alreadyCheckedIn,
            'next_streak_day'        => $nextStreakDay,
            'next_points_if_checkin' => $nextPoints,
            'streak_started_at'      => $user->streak_started_at?->toDateString(),
            'point_balance'          => $user->point_balance,
        ];
    }
}
