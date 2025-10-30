<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // create admin role & user
        $adminRole = \App\Models\Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);

        $admin = \App\Models\User::firstOrCreate([
            'email' => 'admin@example.com'
        ], [
            'name' => 'Administrator',
            'password' => bcrypt('password'),
        ]);

        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        // run other seeders for initial domain data
        $this->call([
            ServiceTypeSeeder::class,
            ZoneSeeder::class,
            CitySeeder::class,
            BookingTypeSeeder::class,
            CustomerSeeder::class,
            BookingSeeder::class,
        ]);
    }
}
