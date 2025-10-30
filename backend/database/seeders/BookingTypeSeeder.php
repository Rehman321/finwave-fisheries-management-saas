<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BookingType;

class BookingTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Standard', 'description' => 'Standard booking'],
            ['name' => 'Express', 'description' => 'Express booking'],
            ['name' => 'Premium', 'description' => 'Premium booking with extras'],
        ];

        foreach ($types as $t) {
            BookingType::firstOrCreate(['name' => $t['name']], ['description' => $t['description']]);
        }
    }
}
