<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('role') ? (is_object($this->route('role')) ? $this->route('role')->id : $this->route('role')) : null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles','name')->ignore($roleId),
            ],
            'label' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ];
    }
}
