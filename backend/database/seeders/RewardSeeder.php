<?php

namespace Database\Seeders;

use App\Models\Reward;
use Illuminate\Database\Seeder;

class RewardSeeder extends Seeder
{
    public function run(): void
    {
        $rewards = [
            [
                'name'            => 'Voucher Diskon Rp5.000',
                'description'     => 'Potongan Rp5.000 untuk semua menu',
                'type'            => 'discount',
                'points_required' => 100,
                'discount_value'  => 5000,
                'product_id'      => null,
                'is_active'       => true,
            ],
            [
                'name'            => 'Voucher Diskon Rp10.000',
                'description'     => 'Potongan Rp10.000 untuk semua menu',
                'type'            => 'discount',
                'points_required' => 200,
                'discount_value'  => 10000,
                'product_id'      => null,
                'is_active'       => true,
            ],
            [
                'name'            => 'Voucher Diskon Rp25.000',
                'description'     => 'Potongan Rp25.000 untuk semua menu',
                'type'            => 'discount',
                'points_required' => 500,
                'discount_value'  => 25000,
                'product_id'      => null,
                'is_active'       => true,
            ],
        ];

        foreach ($rewards as $reward) {
            Reward::firstOrCreate(
                ['name' => $reward['name']],
                $reward
            );
        }
    }
}
