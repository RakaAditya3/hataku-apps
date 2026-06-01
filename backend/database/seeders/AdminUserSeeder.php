<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('admin_users')->insert([
            'name'       => 'Admin HATAKU',
            'email'      => 'hataku.id@gmail.com',
            'password'   => Hash::make('hataku2024!'),
            'role'       => 'admin',
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
