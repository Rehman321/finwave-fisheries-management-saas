<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Role;
use App\Models\User;

class ServiceTypeApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_type_crud()
    {
        // act as admin
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        $admin = User::factory()->create();
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);
        $this->actingAs($admin, 'sanctum');

        $res = $this->getJson('/api/service-types');
        $res->assertSuccessful();

        $payload = ['name' => 'Delivery', 'description' => 'Delivery service'];
        $res = $this->postJson('/api/service-types', $payload);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'Delivery']);
        $id = $res->json('id') ?? $res->json('data.id');

        $res = $this->getJson('/api/service-types/'.$id);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'Delivery']);

        $res = $this->putJson('/api/service-types/'.$id, ['name' => 'Pickup']);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'Pickup']);

        $res = $this->deleteJson('/api/service-types/'.$id);
        $res->assertStatus(204);
    }
}
