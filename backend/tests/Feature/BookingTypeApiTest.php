<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Role;
use App\Models\User;

class BookingTypeApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_type_crud()
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        $admin = User::factory()->create();
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);
        $this->actingAs($admin, 'sanctum');

        $res = $this->getJson('/api/booking-types');
        $res->assertSuccessful();

        $payload = ['name' => 'Onsite', 'description' => 'Onsite booking'];
        $res = $this->postJson('/api/booking-types', $payload);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'Onsite']);
        $id = $res->json('id') ?? $res->json('data.id');

        $res = $this->getJson('/api/booking-types/'.$id);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'Onsite']);

        $res = $this->putJson('/api/booking-types/'.$id, ['name' => 'Remote']);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'Remote']);

        $res = $this->deleteJson('/api/booking-types/'.$id);
        $res->assertStatus(204);
    }
}
