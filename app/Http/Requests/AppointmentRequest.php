<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    
    public function rules(): array
    {
        return [
            'doctor_profile_id' => ['required', 'exists:doctor_profiles,id'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'availability_id' => ['required', 'exists:doctor_availabilities,id'],
        ];
    }
    
    public function messages(): array
    {
        return [
            'date.after_or_equal' => 'Appointment date must be today or in the future.',
        ];
    }
}
