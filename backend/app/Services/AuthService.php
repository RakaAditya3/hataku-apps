<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthService
{
    public function findOrCreateUser(array $googleData): User
    {
        return DB::transaction(function () use ($googleData) {
            $user = User::where('google_id', $googleData['google_id'])
                ->orWhere('email', $googleData['email'])
                ->first();

            if ($user) {
                $user->update([
                    'google_id'  => $googleData['google_id'],
                    'avatar_url' => $googleData['avatar_url'] ?? $user->avatar_url,
                    'name'       => $googleData['name'] ?? $user->name,
                ]);

                return $user->fresh();
            }

            return User::create([
                'name'          => $googleData['name'],
                'email'         => $googleData['email'],
                'google_id'     => $googleData['google_id'],
                'avatar_url'    => $googleData['avatar_url'] ?? null,
                'referral_code' => $this->generateUniqueReferralCode(),
            ])->fresh();
        });
    }

    private function generateUniqueReferralCode(): string
    {
        do {
            $code = 'HTK' . strtoupper(Str::random(6));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}
