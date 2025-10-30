<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Role;
use App\Models\User;

class RoleApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_crud()
    {
        // create admin user and act as them
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        $adminUser = User::factory()->create();
        $adminUser->roles()->syncWithoutDetaching([$adminRole->id]);
        $this->actingAs($adminUser, 'sanctum');

        // Index empty
        $res = $this->getJson('/api/roles');
        $res->assertStatus(200)->assertJsonStructure(['data','links','meta']);

    // Create
    $payload = ['name' => 'manager', 'label' => 'Manager'];
        $res = $this->postJson('/api/roles', $payload);
    $res->assertStatus(201)->assertJsonFragment(['name' => 'manager']);
        $id = $res->json('id') ?? $res->json('data.id');

        // Show
    $res = $this->getJson('/api/roles/'.$id);
    $res->assertStatus(200)->assertJsonFragment(['name' => 'manager']);

        // Update
        $res = $this->putJson('/api/roles/'.$id, ['name' => 'superadmin']);
        $res->assertStatus(200)->assertJsonFragment(['name' => 'superadmin']);

        // Delete
        $res = $this->deleteJson('/api/roles/'.$id);
        $res->assertStatus(204);
    }
}
