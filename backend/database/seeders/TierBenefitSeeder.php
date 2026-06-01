<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TierBenefitSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tier_benefits')->insert([
            [
                'tier'          => 'bamboo',
                'benefit_type'  => 'point_bonus',
                'bonus_percent' => 0,
                'description'   => 'Tier dasar, tanpa bonus point',
                'is_active'     => false,
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'tier'          => 'jade',
                'benefit_type'  => 'point_bonus',
                'bonus_percent' => 20,
                'description'   => 'Bonus +20% point setiap transaksi',
                'is_active'     => true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'tier'          => 'imperial',
                'benefit_type'  => 'point_bonus',
                'bonus_percent' => 35,
                'description'   => 'Bonus +35% point setiap transaksi',
                'is_active'     => true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'tier'          => 'dragon',
                'benefit_type'  => 'point_bonus',
                'bonus_percent' => 50,
                'description'   => 'Bonus +50% point setiap transaksi',
                'is_active'     => true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ]);
    }
}
