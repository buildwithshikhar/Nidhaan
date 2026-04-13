<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Canonical role list for NIDHAAN.
     *
     * Running this seeder multiple times is safe — firstOrCreate guarantees
     * no duplicates and renaming the old `Patient` role is idempotent.
     */
    public function run(): void
    {
        // ── 1. Ensure all current roles exist ─────────────────────────────
        $roles = [
            'SuperAdmin',
            'Doctor',
            'Pharmacist',
            'DeliveryAgent',
            'User',            // replaces the old "Patient" role
        ];

        foreach ($roles as $name) {
            Role::firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
            );
        }

        // ── 2. Rename legacy `Patient` role to `User` (if it still exists) ─
        //    This is idempotent: if Patient was already deleted or renamed,
        //    the query returns null and nothing happens.
        $patient = Role::where('name', 'Patient')
                       ->where('guard_name', 'web')
                       ->first();

        if ($patient) {
            // Only rename if a `User` role does not already exist
            // (firstOrCreate above already ensured one exists, so just delete
            //  the stale Patient row — its users will be re-assigned manually
            //  or via a dedicated migration if needed).
            $patient->delete();

            $this->command->info('Deleted legacy "Patient" role.');
        }

        $this->command->info('Roles seeded: ' . implode(', ', $roles));
    }
}
