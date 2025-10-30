<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_crud()
    {
        // create service type (admin)
        $adminRole = \App\Models\Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        $admin = \App\Models\User::factory()->create();
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);
        $this->actingAs($admin, 'sanctum');

        $stRes = $this->postJson('/api/service-types', ['name' => 'Delivery']);
        $stRes->assertSuccessful();
        $stId = $stRes->json('id') ?? $stRes->json('data.id');

        // booking type
        $btRes = $this->postJson('/api/booking-types', ['name' => 'Onsite']);
        $btRes->assertSuccessful();
        $btId = $btRes->json('id') ?? $btRes->json('data.id');

        // zone + city + customer
        $zoneRes = $this->postJson('/api/zones', ['name' => 'Zone X']);
        $zoneRes->assertSuccessful();
        $zoneId = $zoneRes->json('id') ?? $zoneRes->json('data.id');

        $cityRes = $this->postJson('/api/cities', ['name' => 'City X', 'zone_id' => $zoneId]);
        $cityRes->assertSuccessful();
        $cityId = $cityRes->json('id') ?? $cityRes->json('data.id');

        $custRes = $this->postJson('/api/customers', ['name' => 'Cust X', 'city_id' => $cityId]);
        $custRes->assertSuccessful();
        $custId = $custRes->json('id') ?? $custRes->json('data.id');

        // create booking
        $payload = [
            'customer_id' => $custId,
            'booking_type_id' => $btId,
            'service_type_id' => $stId,
            'scheduled_at' => now()->toDateTimeString(),
            'status' => 'pending',
        ];

        $res = $this->postJson('/api/bookings', $payload);
        $res->assertSuccessful()->assertJsonFragment(['status' => 'pending']);
        $id = $res->json('id') ?? $res->json('data.id');

        $res = $this->getJson('/api/bookings/'.$id);
        $res->assertSuccessful()->assertJsonFragment(['status' => 'pending']);

        $res = $this->putJson('/api/bookings/'.$id, ['status' => 'confirmed', 'customer_id' => $custId, 'booking_type_id' => $btId]);
        $res->assertSuccessful()->assertJsonFragment(['status' => 'confirmed']);

        $res = $this->deleteJson('/api/bookings/'.$id);
        $res->assertStatus(204);
    }
}
