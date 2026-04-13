<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;

class DashboardController extends Controller
{
    public function index()
    {
        $doctorProfile = Auth::user()->doctorProfile;

        // ✅ SAFETY CHECK (VERY IMPORTANT)
        if (!$doctorProfile) {
            abort(403, 'Doctor profile not found');
        }

        $appointments = Appointment::where('doctor_profile_id', $doctorProfile->id)->get();

        return inertia('Doctor/Dashboard', [
            'total' => $appointments->count(),
            'pending' => $appointments->where('status', 'pending')->count(),
            'completed' => $appointments->where('status', 'completed')->count(),
        ]);
    }
}