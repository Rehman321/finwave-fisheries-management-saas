<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;

class CustomerController extends Controller
{
    public function index()
    {
        return CustomerResource::collection(Customer::with('city','zones')->paginate());
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());
        if ($zones = $request->input('zone_ids')) {
            $customer->zones()->sync($zones);
        }
        return new CustomerResource($customer->load('city','zones'));
    }

    public function show(Customer $customer)
    {
        return new CustomerResource($customer->load('city','zones'));
    }

    public function update(StoreCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());
        if ($zones = $request->input('zone_ids')) {
            $customer->zones()->sync($zones);
        }
        return new CustomerResource($customer->load('city','zones'));
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->noContent();
    }
}
