<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;

class BookingController extends Controller
{
    public function index()
    {
        return BookingResource::collection(Booking::with(['customer','bookingType','serviceType'])->paginate());
    }

    public function store(StoreBookingRequest $request)
    {
        $booking = Booking::create($request->validated());
        return new BookingResource($booking->load(['customer','bookingType','serviceType']));
    }

    public function show(Booking $booking)
    {
        return new BookingResource($booking->load(['customer','bookingType','serviceType']));
    }

    public function update(StoreBookingRequest $request, Booking $booking)
    {
        $booking->update($request->validated());
        return new BookingResource($booking->load(['customer','bookingType','serviceType']));
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();
        return response()->noContent();
    }
}
