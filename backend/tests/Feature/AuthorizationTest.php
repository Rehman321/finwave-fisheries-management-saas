<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Role;
use App\Models\User;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_roles_endpoint_requires_authentication()
    {
        $res = $this->getJson('/api/roles');
        $res->assertStatus(401);
    }

    public function test_roles_endpoint_forbids_non_admin_users()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $res = $this->getJson('/api/roles');
        $res->assertStatus(403);
    }

    public function test_roles_endpoint_allows_admin_users()
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        $admin = User::factory()->create();
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        $this->actingAs($admin, 'sanctum');

        $res = $this->getJson('/api/roles');
        $res->assertStatus(200);
    }
}
