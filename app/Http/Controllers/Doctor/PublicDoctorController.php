<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\DoctorProfile;
use Inertia\Inertia;

class PublicDoctorController extends Controller
{
    public function index()
    {
        $doctors = DoctorProfile::with('user')->get();

        return Inertia::render('Doctors/Index', [
            'doctors' => $doctors
        ]);
    }

    public function show($id)
    {
        $doctor = DoctorProfile::with(['user', 'availabilities' => function ($query) {
            $query->where('is_booked', false)
                  ->where('date', '>=', now()->toDateString())
                  ->orderBy('date')
                  ->orderBy('start_time');
        }])->findOrFail($id);

        return Inertia::render('Doctors/Show', [
            'doctor' => $doctor
        ]);
    }
}
