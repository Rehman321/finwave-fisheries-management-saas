<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\BookingType;
use App\Models\Customer;
use App\Models\ServiceType;
use Illuminate\Support\Str;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $bookingTypes = BookingType::all();
        $customers = Customer::all();
        $serviceTypes = ServiceType::all();

        if ($bookingTypes->isEmpty() || $customers->isEmpty() || $serviceTypes->isEmpty()) {
            // nothing to seed if core data missing
            return;
        }

        // create a few sample bookings
        $now = Carbon::now();

        $samples = [
            [
                'customer' => $customers->random(),
                'booking_type' => $bookingTypes->random(),
                'service_type' => $serviceTypes->random(),
                'scheduled_at' => $now->copy()->addDays(2),
                'notes' => 'Sample standard booking',
            ],
            [
                'customer' => $customers->random(),
                'booking_type' => $bookingTypes->random(),
                'service_type' => $serviceTypes->random(),
                'scheduled_at' => $now->copy()->addDays(5)->hour(9),
                'notes' => 'Early morning pickup',
            ],
            [
                'customer' => $customers->random(),
                'booking_type' => $bookingTypes->random(),
                'service_type' => $serviceTypes->random(),
                'scheduled_at' => $now->copy()->addDays(7)->hour(15),
                'notes' => 'Express delivery request',
            ],
        ];

        foreach ($samples as $s) {
            Booking::create([
                'customer_id' => $s['customer']->id,
                'booking_type_id' => $s['booking_type']->id,
                'service_type_id' => $s['service_type']->id,
                'scheduled_at' => $s['scheduled_at'],
                'notes' => $s['notes'],
            ]);
        }
    }
}
