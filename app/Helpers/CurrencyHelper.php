<?php

namespace App\Helpers;

class CurrencyHelper
{
    /**
     * Format amount as INR (₹)
     */
    public static function formatINR(float|int $amount): string
    {
        return '₹' . number_format($amount, 2, '.', ',');
    }
    
    /**
     * Convert rupees to paise (for storage)
     */
    public static function toPaise(float $rupees): int
    {
        return (int) round($rupees * 100);
    }
    
    /**
     * Convert paise to rupees
     */
    public static function toRupees(int $paise): float
    {
        return $paise / 100;
    }
}
