<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending    = 'pending';
    case Processing = 'processing';
    case Shipped    = 'shipped';
    case Delivered  = 'delivered';

    // -------------------------------------------------------------------------
    //  Transition graph
    // -------------------------------------------------------------------------

    /**
     * Returns the only valid next state from this one, or null if terminal.
     */
    public function next(): ?self
    {
        return match ($this) {
            self::Pending    => self::Processing,
            self::Processing => self::Shipped,
            self::Shipped    => self::Delivered,
            self::Delivered  => null,
        };
    }

    /**
     * Is a transition from $this → $target allowed?
     */
    public function canTransitionTo(self $target): bool
    {
        return $this->next() === $target;
    }

    // -------------------------------------------------------------------------
    //  Role-gate: which roles may perform each transition?
    // -------------------------------------------------------------------------

    /**
     * Roles permitted to trigger a transition FROM this status to the next one.
     *
     * @return list<string>
     */
    public function allowedRoles(): array
    {
        return match ($this) {
            // pending → processing : admins and pharmacists
            self::Pending    => ['SuperAdmin', 'Pharmacist'],
            // processing → shipped : super-admins only
            self::Processing => ['SuperAdmin'],
            // shipped → delivered  : delivery agents
            self::Shipped    => ['DeliveryAgent'],
            // terminal state
            self::Delivered  => [],
        };
    }

    // -------------------------------------------------------------------------
    //  Display helpers
    // -------------------------------------------------------------------------

    public function label(): string
    {
        return match ($this) {
            self::Pending    => 'Pending',
            self::Processing => 'Processing',
            self::Shipped    => 'Shipped',
            self::Delivered  => 'Delivered',
        };
    }

    /**
     * Tailwind colour token for badge rendering on the frontend.
     */
    public function colour(): string
    {
        return match ($this) {
            self::Pending    => 'amber',
            self::Processing => 'blue',
            self::Shipped    => 'violet',
            self::Delivered  => 'emerald',
        };
    }
}
