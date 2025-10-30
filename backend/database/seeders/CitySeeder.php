<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\Zone;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            'Harbor City',
            'Baytown',
            "Fisherman's Rest",
        ];

        // ensure there's at least one zone to attach to
        $defaultZone = Zone::first() ?? Zone::create(['name' => 'Default Zone', 'description' => 'Default zone']);

        foreach ($cities as $name) {
            City::firstOrCreate(['name' => $name], ['zone_id' => $defaultZone->id]);
        }
    }
}
