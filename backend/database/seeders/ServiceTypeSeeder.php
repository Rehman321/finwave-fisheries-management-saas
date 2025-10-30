<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceType;

class ServiceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Delivery', 'description' => 'Delivery service'],
            ['name' => 'Pickup', 'description' => 'Pickup service'],
            ['name' => 'Consultation', 'description' => 'Consultation service'],
        ];

        foreach ($types as $t) {
            ServiceType::firstOrCreate(['name' => $t['name']], ['description' => $t['description']]);
        }
    }
}
