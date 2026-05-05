<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Rules\IndianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisteredUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone')) {
            $phone = preg_replace('/^\+?91\s*/', '', $this->phone);
            $phone = preg_replace('/\D/', '', $phone); // Strip all non-digits
            $this->merge([
                'phone' => $phone,
            ]);
        }
    }
    
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:' . User::class],
            'phone' => ['required', 'string', 'unique:' . User::class, new IndianPhone()],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
    
    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already registered.',
            'phone.unique' => 'This phone number is already registered.',
            'phone.required' => 'Phone number is required (10-digit Indian format).',
        ];
    }
}
