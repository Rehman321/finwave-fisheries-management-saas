<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_crud_and_zones()
    {
        // create zone and city
        $zoneRes = $this->postJson('/api/zones', ['name' => 'Zone B']);
        $zoneRes->assertSuccessful();
        $zoneId = $zoneRes->json('id') ?? $zoneRes->json('data.id');

        $cityRes = $this->postJson('/api/cities', ['name' => 'City B', 'zone_id' => $zoneId]);
        $cityRes->assertSuccessful();
        $cityId = $cityRes->json('id') ?? $cityRes->json('data.id');

        $res = $this->getJson('/api/customers');
        $res->assertSuccessful();

        $payload = ['name' => 'John Doe', 'email' => 'john@example.com', 'city_id' => $cityId, 'zone_ids' => [$zoneId]];
        $res = $this->postJson('/api/customers', $payload);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'John Doe']);
        $id = $res->json('id') ?? $res->json('data.id');

        $res = $this->getJson('/api/customers/'.$id);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'John Doe']);

        $res = $this->putJson('/api/customers/'.$id, ['name' => 'Jane Doe']);
        $res->assertSuccessful()->assertJsonFragment(['name' => 'Jane Doe']);

        $res = $this->deleteJson('/api/customers/'.$id);
        $res->assertStatus(204);
    }
}
