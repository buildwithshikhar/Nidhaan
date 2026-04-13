<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\DoctorAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DoctorAvailabilityController extends Controller
{
    public function index()
    {
        $doctorProfile = Auth::user()->doctorProfile;

        if (!$doctorProfile) {
            abort(403, 'Doctor profile not found.');
        }

        $availabilities = $doctorProfile->availabilities()
            ->orderBy('date', 'desc')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Doctor/Availability', [
            'availabilities' => $availabilities
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $doctorProfile = Auth::user()->doctorProfile;

        if (!$doctorProfile) {
            abort(403, 'Doctor profile not found.');
        }

        // Optional: Check if slot already exists to prevent duplicate exact slots
        $exists = DoctorAvailability::where('doctor_profile_id', $doctorProfile->id)
            ->where('date', $request->date)
            ->where('start_time', $request->start_time)
            ->where('end_time', $request->end_time)
            ->exists();

        if ($exists) {
            return back()->withErrors(['date' => 'This exact availability slot already exists.']);
        }

        DoctorAvailability::create([
            'doctor_profile_id' => $doctorProfile->id,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'is_booked' => false,
        ]);

        return back()->with('success', 'Availability slot added successfully.');
    }
}
