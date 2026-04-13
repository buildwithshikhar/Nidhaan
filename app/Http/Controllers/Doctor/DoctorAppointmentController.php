<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;

class DoctorAppointmentController extends Controller
{
    public function index()
    {
        $doctorProfile = Auth::user()->doctorProfile;

        if (!$doctorProfile) {
            abort(403, 'Doctor profile not found');
        }

        $appointments = Appointment::with('user')
            ->where('doctor_profile_id', $doctorProfile->id)
            ->latest()
            ->get();

        return inertia('Doctor/Appointments', [
            'appointments' => $appointments
        ]);
    }

    public function updateStatus(Request $request, Appointment $appointment)
    {
        $request->validate([
            'status' => ['required', 'in:processing,completed,cancelled']
        ]);

        $appointment->update([
            'status' => $request->status
        ]);

        return back()->with('success', 'Status updated');
    }
}