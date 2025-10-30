<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'booking_type' => new BookingTypeResource($this->whenLoaded('bookingType')),
            'service_type' => new ServiceTypeResource($this->whenLoaded('serviceType')),
            'scheduled_at' => $this->scheduled_at,
            'status' => $this->status,
            'notes' => $this->notes,
        ];
    }
}
