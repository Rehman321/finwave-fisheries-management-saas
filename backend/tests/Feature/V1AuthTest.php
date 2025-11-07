<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Str;

class V1AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_token_login_and_me_and_logout()
    {
        $email = 'apiuser@example.com';
        $password = 'secret123';
        $user = User::factory()->create([
            'email' => $email,
            'password' => bcrypt($password),
        ]);

        $res = $this->postJson('/api/v1/auth/login', ['email' => $email, 'password' => $password]);
        $res->assertStatus(200)->assertJsonStructure(['user', 'token']);

        $token = $res->json('token');
        $this->assertNotEmpty($token);

        // call me with Authorization header
        $me = $this->getJson('/api/v1/auth/me', ['Authorization' => 'Bearer ' . $token]);
        $me->assertStatus(200)->assertJsonFragment(['email' => $email]);

        // logout with token
        $logout = $this->postJson('/api/v1/auth/logout', [], ['Authorization' => 'Bearer ' . $token]);
        $logout->assertStatus(200)->assertJson(['message' => 'Logged out successfully']);
    }

    public function test_cookie_login_flow_and_me()
    {
        $email = 'cookieuser@example.com';
        $password = 'secret456';
        $user = User::factory()->create([
            'email' => $email,
            'password' => bcrypt($password),
        ]);

        // get csrf cookie
        $this->get('/sanctum/csrf-cookie');

        $login = $this->post('/login', ['email' => $email, 'password' => $password]);
        $login->assertStatus(200)->assertJsonFragment(['email' => $email]);

        // access /api/v1/auth/me which is protected by auth:sanctum
        $me = $this->getJson('/api/v1/auth/me');
        $me->assertStatus(200)->assertJsonFragment(['email' => $email]);
    }
}
