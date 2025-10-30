<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceTypeRequest;
use App\Http\Resources\ServiceTypeResource;
use App\Models\ServiceType;

class ServiceTypeController extends Controller
{
    public function index()
    {
        return ServiceTypeResource::collection(ServiceType::paginate());
    }

    public function store(StoreServiceTypeRequest $request)
    {
        $st = ServiceType::create($request->validated());
        return new ServiceTypeResource($st);
    }

    public function show(ServiceType $serviceType)
    {
        return new ServiceTypeResource($serviceType);
    }

    public function update(StoreServiceTypeRequest $request, ServiceType $serviceType)
    {
        $serviceType->update($request->validated());
        return new ServiceTypeResource($serviceType);
    }

    public function destroy(ServiceType $serviceType)
    {
        $serviceType->delete();
        return response()->noContent();
    }
}
