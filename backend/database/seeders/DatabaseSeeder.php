<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            OptionGroupSeeder::class,
            OptionItemSeeder::class,
            TierBenefitSeeder::class,
            AdminUserSeeder::class,
            ProductSeeder::class,
        ]);
    }
}
