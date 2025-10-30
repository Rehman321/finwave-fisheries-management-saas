<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Zone;

class ZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            ['name' => 'North Zone', 'description' => 'Northern fishing zone'],
            ['name' => 'South Zone', 'description' => 'Southern fishing zone'],
            ['name' => 'East Zone', 'description' => 'Eastern fishing zone'],
            ['name' => 'West Zone', 'description' => 'Western fishing zone'],
        ];

        foreach ($zones as $z) {
            Zone::firstOrCreate(['name' => $z['name']], ['description' => $z['description']]);
        }
    }
}
