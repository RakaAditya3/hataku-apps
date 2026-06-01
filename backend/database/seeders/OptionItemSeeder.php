<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OptionItemSeeder extends Seeder
{
    public function run(): void
    {
        $sauces = [
            'Mentai',
            'Tar Tar',
            'Volcano',
            'Cheese',
            'Carbonara',
            'Creamy Bolognese',
            'Mentai Mix Tar Tar',
            'Mentai Mix Volcano',
            'Mentai Mix Carbonara',
            'Mentai Mix Cheese',
            'Mentai Mix Bolognese',
            'Carbonara Mix Bolognese',
        ];

        $toppings = [
            'Topping Boncabe',
            'Katsuoboshi',
            'Red Cheddar Slice',
            'Mozza',
        ];

        foreach ($sauces as $index => $name) {
            DB::table('option_items')->insert([
                'option_group_id' => 1,
                'name'            => $name,
                'sort_order'      => $index + 1,
                'is_active'       => true,
                'created_at'      => now(),
            ]);
        }

        foreach ($toppings as $index => $name) {
            DB::table('option_items')->insert([
                'option_group_id' => 2,
                'name'            => $name,
                'sort_order'      => $index + 1,
                'is_active'       => true,
                'created_at'      => now(),
            ]);
        }
    }
}
