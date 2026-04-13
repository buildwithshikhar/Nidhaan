<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LabTest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'fasting_required',
        'sample_type',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'fasting_required' => 'boolean',
        ];
    }

    /**
     * @return HasMany<LabBooking, $this>
     */
    public function labBookings(): HasMany
    {
        return $this->hasMany(LabBooking::class);
    }
}
