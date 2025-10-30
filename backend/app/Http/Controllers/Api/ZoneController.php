<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreZoneRequest;
use App\Http\Resources\ZoneResource;
use App\Models\Zone;

class ZoneController extends Controller
{
    public function index()
    {
        return ZoneResource::collection(Zone::paginate());
    }

    public function store(StoreZoneRequest $request)
    {
        $zone = Zone::create($request->validated());
        return new ZoneResource($zone);
    }

    public function show(Zone $zone)
    {
        return new ZoneResource($zone);
    }

    public function update(StoreZoneRequest $request, Zone $zone)
    {
        $zone->update($request->validated());
        return new ZoneResource($zone);
    }

    public function destroy(Zone $zone)
    {
        $zone->delete();
        return response()->noContent();
    }
}
