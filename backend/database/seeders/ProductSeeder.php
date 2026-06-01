<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // Products: [category_id, name, price, sort_order]
        $products = [
            // Original Series (cat 1)
            [1, 'Regular Original', 23000, 1],
            [1, 'Large Original',   28000, 2],
            [1, 'Family Original',  55000, 3],

            // Mozza Series (cat 2)
            [2, 'Regular Mozza', 30000, 1],
            [2, 'Large Mozza',   33000, 2],
            [2, 'Family Mozza',  65000, 3],

            // Mix Series (cat 3) — index 6-8 in zero-based below
            [3, 'Regular Mix', 28000, 1],
            [3, 'Large Mix',   33000, 2],
            [3, 'Family Mix',  65000, 3],

            // Katsuo Series (cat 4)
            [4, 'Regular Katsuo', 25000, 1],
            [4, 'Large Katsuo',   30000, 2],
            [4, 'Family Katsuo',  60000, 3],

            // Dimsum (cat 5)
            [5, 'Dimsum Original (1 pcs)', 3000, 1],
            [5, 'Dimsum Mentai (1 pcs)',   4500, 2],

            // Cheezy Series (cat 6)
            [6, 'Regular Cheezy', 25000, 1],
            [6, 'Large Cheezy',   30000, 2],
            [6, 'Family Cheezy',  60000, 3],

            // Boncabe Series (cat 7)
            [7, 'Regular Boncabe', 25000, 1],
            [7, 'Large Boncabe',   30000, 2],
            [7, 'Family Boncabe',  60000, 3],

            // Signature New (cat 8)
            [8, 'Dimgoju',         6000,  1],
            [8, 'Dimgoju Mentai',  15000, 2],
            [8, 'Mix Platter',     65000, 3],
        ];

        $productIds = [];

        foreach ($products as [$categoryId, $name, $price, $sortOrder]) {
            $id = DB::table('products')->insertGetId([
                'category_id'       => $categoryId,
                'name'              => $name,
                'price'             => $price,
                'sort_order'        => $sortOrder,
                'is_available'      => true,
                'is_deleted'        => false,
                'daily_stock_limit' => null,
                'created_at'        => $now,
                'updated_at'        => $now,
            ]);

            $productIds[] = ['id' => $id, 'name' => $name, 'category_id' => $categoryId];
        }

        // All products get Saus option (group id=1, min=1, max=1)
        foreach ($productIds as $product) {
            DB::table('product_option_groups')->insert([
                'product_id'      => $product['id'],
                'option_group_id' => 1,
                'min_select'      => 1,
                'max_select'      => 1,
            ]);
        }

        // Mix Series gets Topping option (group id=2) with size-based overrides
        $mixOverrides = [
            'Regular Mix' => ['min' => 3, 'max' => 3],
            'Large Mix'   => ['min' => 2, 'max' => 4],
            'Family Mix'  => ['min' => 4, 'max' => 4],
        ];

        foreach ($productIds as $product) {
            if (isset($mixOverrides[$product['name']])) {
                $override = $mixOverrides[$product['name']];
                DB::table('product_option_groups')->insert([
                    'product_id'      => $product['id'],
                    'option_group_id' => 2,
                    'min_select'      => $override['min'],
                    'max_select'      => $override['max'],
                ]);
            }
        }
    }
}
