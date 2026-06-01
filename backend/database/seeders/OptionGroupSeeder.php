<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OptionGroupSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('option_groups')->insert([
            [
                'id'          => 1,
                'name'        => 'Pilihan Saus',
                'is_required' => true,
                'min_select'  => 1,
                'max_select'  => 1,
                'created_at'  => now(),
            ],
            [
                'id'          => 2,
                'name'        => 'Pilihan Topping',
                'is_required' => true,
                'min_select'  => 2,
                'max_select'  => 4,
                'created_at'  => now(),
            ],
        ]);
    }
}
