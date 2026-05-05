<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoctorProfile extends Model
{
    use SoftDeletes;

    protected static function booted(): void
    {
        // Auto-assign Doctor role when a profile is created
        static::created(function (DoctorProfile $profile) {
            $user = $profile->user;
            if ($user && ! $user->hasRole('Doctor')) {
                $user->assignRole('Doctor');
            }
        });

        // Also handle if user_id changes on update
        static::updated(function (DoctorProfile $profile) {
            if ($profile->wasChanged('user_id')) {
                $user = $profile->user;
                if ($user && ! $user->hasRole('Doctor')) {
                    $user->assignRole('Doctor');
                }
            }
        });
    }

    protected $fillable = [
        'user_id',
        'specialization',
        'experience_years',
        'consultation_fee',
        'availability_schedule',
    ];

    protected function casts(): array
    {
        return [
            'experience_years' => 'integer',
            'consultation_fee' => 'decimal:2',
            'availability_schedule' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Appointment, $this>
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * @return HasMany<DoctorAvailability, $this>
     */
    public function availabilities(): HasMany
    {
        return $this->hasMany(DoctorAvailability::class);
    }
}
