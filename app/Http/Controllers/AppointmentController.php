<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\DoctorAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    public function book(Request $request)
    {
        $request->validate([
            'doctor_profile_id' => ['required', 'exists:doctor_profiles,id'],
            'date' => ['required', 'date'],
            'availability_id' => ['required', 'exists:doctor_availabilities,id'], // time_slot
        ]);

        $availability = DoctorAvailability::where('id', $request->availability_id)
            ->where('doctor_profile_id', $request->doctor_profile_id)
            ->where('date', $request->date)
            ->where('is_booked', false)
            ->firstOrFail();

        DB::transaction(function () use ($request, $availability) {
            // format time string safely
            $timeString = \Carbon\Carbon::parse($availability->start_time)->format('H:i') . ' - ' . \Carbon\Carbon::parse($availability->end_time)->format('H:i');

            Appointment::create([
                'user_id' => Auth::id(),
                'doctor_profile_id' => $request->doctor_profile_id,
                'appointment_date' => $request->date,
                'time_slot' => $timeString,
                'status' => 'pending',
            ]);

            $availability->update(['is_booked' => true]);
        });

        return redirect()->route('orders.index')->with('success', 'Appointment booked successfully.'); // sending them to orders.index, as NIDHAAN might use that for all history, or dashboard.
    }
}
