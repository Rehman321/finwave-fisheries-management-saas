<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('customer') ? (is_object($this->route('customer')) ? $this->route('customer')->id : $this->route('customer')) : null;

        return [
            'name' => 'required|string|max:255',
            'email' => [
                'nullable','email',
                Rule::unique('customers','email')->ignore($id),
            ],
            'phone' => 'nullable|string|max:50',
            'city_id' => 'nullable|exists:cities,id',
            'address' => 'nullable|string',
        ];
    }
}
