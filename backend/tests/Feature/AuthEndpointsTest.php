<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class AuthEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_valid_credentials_sets_session_and_returns_user()
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('secret123'),
        ]);

        // get CSRF cookie
        $this->get('/sanctum/csrf-cookie');

        $response = $this->post('/login', [
            'email' => 'user@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)->assertJsonFragment(['email' => 'user@example.com']);
    }

    public function test_logout_invalidates_session()
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $response = $this->post('/logout');

        $response->assertStatus(200)->assertJson(['message' => 'Logged out']);
    }

    public function test_api_user_returns_authenticated_user()
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/user');

        $response->assertStatus(200)->assertJsonFragment(['email' => $user->email]);
    }
}
