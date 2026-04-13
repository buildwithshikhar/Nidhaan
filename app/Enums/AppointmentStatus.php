<?php

namespace App\Enums;

enum AppointmentStatus: string
{
    case Pending   = 'pending';
    case Accepted  = 'accepted';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    // -----------------------------------------------------------------
    // Display
    // -----------------------------------------------------------------

    public function label(): string
    {
        return match ($this) {
            self::Pending   => 'Pending',
            self::Accepted  => 'Accepted',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    public function colour(): string
    {
        return match ($this) {
            self::Pending   => 'amber',
            self::Accepted  => 'blue',
            self::Completed => 'emerald',
            self::Cancelled => 'rose',
        };
    }

    // -----------------------------------------------------------------
    // State machine — what a Doctor is allowed to transition to
    // -----------------------------------------------------------------

    /**
     * Returns the only valid next status a Doctor can move to,
     * or null if the appointment is already terminal.
     */
    public function nextForDoctor(): ?self
    {
        return match ($this) {
            self::Pending  => self::Accepted,
            self::Accepted => self::Completed,
            default        => null,   // Completed / Cancelled are terminal
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Cancelled], true);
    }
}
