<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServiceTypeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }
    public function rules(): array
    {
        $id = $this->route('service_type') ? (is_object($this->route('service_type')) ? $this->route('service_type')->id : $this->route('service_type')) : null;
        return [
            'name' => [
                'required','string','max:255',
                Rule::unique('service_types','name')->ignore($id),
            ],
            'description' => 'nullable|string',
        ];
    }
}
