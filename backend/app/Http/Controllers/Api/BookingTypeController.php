<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingTypeRequest;
use App\Http\Resources\BookingTypeResource;
use App\Models\BookingType;

class BookingTypeController extends Controller
{
    public function index()
    {
        return BookingTypeResource::collection(BookingType::paginate());
    }

    public function store(StoreBookingTypeRequest $request)
    {
        $bt = BookingType::create($request->validated());
        return new BookingTypeResource($bt);
    }

    public function show(BookingType $bookingType)
    {
        return new BookingTypeResource($bookingType);
    }

    public function update(StoreBookingTypeRequest $request, BookingType $bookingType)
    {
        $bookingType->update($request->validated());
        return new BookingTypeResource($bookingType);
    }

    public function destroy(BookingType $bookingType)
    {
        $bookingType->delete();
        return response()->noContent();
    }
}
