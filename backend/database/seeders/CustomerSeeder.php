<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            ['name' => 'Acme Fisheries', 'email' => 'acme@example.com', 'phone' => '555-0100'],
            ['name' => 'Ocean Traders', 'email' => 'ocean@example.com', 'phone' => '555-0101'],
            ['name' => 'Seafood Hub', 'email' => 'seafood@example.com', 'phone' => '555-0102'],
        ];

        foreach ($customers as $c) {
            Customer::firstOrCreate(['email' => $c['email']], $c);
        }
    }
}
