<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCityRequest;
use App\Http\Resources\CityResource;
use App\Models\City;

class CityController extends Controller
{
    public function index()
    {
        return CityResource::collection(City::with('zone')->paginate());
    }

    public function store(StoreCityRequest $request)
    {
        $city = City::create($request->validated());
        return new CityResource($city->load('zone'));
    }

    public function show(City $city)
    {
        return new CityResource($city->load('zone'));
    }

    public function update(StoreCityRequest $request, City $city)
    {
        $city->update($request->validated());
        return new CityResource($city->load('zone'));
    }

    public function destroy(City $city)
    {
        $city->delete();
        return response()->noContent();
    }
}
