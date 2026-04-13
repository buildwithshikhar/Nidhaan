<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // route is already protected by 'auth' middleware
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'shipping_address' => ['required', 'string', 'min:10', 'max:500'],

            // Optional prescription file — allow common document/image types, max 5 MB
            'prescription' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120', // 5 MB in kilobytes
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'shipping_address.required' => 'A shipping address is required to place your order.',
            'shipping_address.min'      => 'Please enter your full shipping address (at least 10 characters).',
            'prescription.mimes'        => 'Prescription must be a JPG, PNG, or PDF file.',
            'prescription.max'          => 'Prescription file must not exceed 5 MB.',
        ];
    }
}
