<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ZoneApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_zone_crud()
    {
        $res = $this->getJson('/api/zones');
        $res->assertSuccessful();

        $payload = ['name' => 'North Zone', 'code' => 'NZ'];
        $res = $this->postJson('/api/zones', $payload);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'North Zone']);
        $id = $res->json('id') ?? $res->json('data.id');

        $res = $this->getJson('/api/zones/'.$id);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'North Zone']);

        $res = $this->putJson('/api/zones/'.$id, ['name' => 'South Zone']);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'South Zone']);

        $res = $this->deleteJson('/api/zones/'.$id);
        $res->assertStatus(204);
    }
}
