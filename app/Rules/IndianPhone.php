<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class IndianPhone implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Accept: 10 digits, or +91 followed by 10 digits, or 91 followed by 10 digits
        $cleaned = preg_replace('/[\s\-()]/', '', $value);
        
        if (!preg_match('/^(\+91|91)?[6-9]\d{9}$/', $cleaned)) {
            $fail('The :attribute must be a valid 10-digit Indian phone number.');
        }
    }
}
