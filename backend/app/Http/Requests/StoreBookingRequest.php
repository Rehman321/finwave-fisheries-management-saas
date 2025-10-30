<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'booking_type_id' => 'required|exists:booking_types,id',
            'service_type_id' => 'nullable|exists:service_types,id',
            'scheduled_at' => 'nullable|date',
            'status' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ];
    }
}
