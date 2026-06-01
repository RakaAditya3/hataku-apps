<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Original Series',
            'Mozza Series',
            'Mix Series',
            'Katsuo Series',
            'Dimsum',
            'Cheezy Series',
            'Boncabe Series',
            'Signature New',
        ];

        foreach ($categories as $index => $name) {
            DB::table('categories')->insert([
                'name'       => $name,
                'sort_order' => $index + 1,
                'is_active'  => true,
                'is_deleted' => false,
                'created_at' => now(),
            ]);
        }
    }
}
