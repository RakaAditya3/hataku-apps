<?php

namespace App\Services;

use App\Models\User;

class TierService
{
    public function checkAndUpgrade(User $user): void
    {
        $count = $user->valid_transaction_count;

        $newTier = match (true) {
            $count >= 50 => 'dragon',
            $count >= 25 => 'imperial',
            $count >= 5  => 'jade',
            default      => 'bamboo',
        };

        if ($this->tierRank($newTier) > $this->tierRank($user->tier)) {
            $user->update(['tier' => $newTier]);
        }
    }

    private function tierRank(string $tier): int
    {
        return match ($tier) {
            'bamboo'   => 0,
            'jade'     => 1,
            'imperial' => 2,
            'dragon'   => 3,
            default    => 0,
        };
    }
}
