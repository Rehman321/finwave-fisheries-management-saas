<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CityApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_city_crud()
    {
        // need a zone first
        $zoneRes = $this->postJson('/api/zones', ['name' => 'Zone A']);
        $zoneRes->assertSuccessful();
        $zoneId = $zoneRes->json('id') ?? $zoneRes->json('data.id');

        $res = $this->getJson('/api/cities');
        $res->assertSuccessful();

        $payload = ['name' => 'Metropolis', 'zone_id' => $zoneId];
        $res = $this->postJson('/api/cities', $payload);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'Metropolis']);
        $id = $res->json('id') ?? $res->json('data.id');

        $res = $this->getJson('/api/cities/'.$id);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'Metropolis']);

        $res = $this->putJson('/api/cities/'.$id, ['name' => 'Gotham', 'zone_id' => $zoneId]);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'Gotham']);

        $res = $this->deleteJson('/api/cities/'.$id);
        $res->assertStatus(204);
    }
}
