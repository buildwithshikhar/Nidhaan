import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppNavbar from '@/Components/AppNavbar';

// Format "HH:MM:SS" → "H:MM AM/PM"
function fmtTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Format ISO date string accounting for timezone offset (avoid off-by-one from UTC midnight)
function fmtDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric',
    });
}

export default function Show({ doctor }) {
    const { auth } = usePage().props;
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        doctor_profile_id: doctor.id,
        date: '',
        availability_id: '',
    });

    const bookAppointment = (slot) => {
        if (!auth.user) {
            window.location.href = route('login');
            return;
        }
        setSelectedSlotId(slot.id);
        setData({
            doctor_profile_id: doctor.id,
            date: typeof slot.date === 'string' ? slot.date.substring(0, 10) : slot.date,
            availability_id: slot.id,
        });
    };

    // Submit whenever a slot is selected and data is ready
    const handleBook = (slot) => {
        if (!auth.user) {
            window.location.href = route('login');
            return;
        }
        const dateStr = typeof slot.date === 'string' ? slot.date.substring(0, 10) : slot.date;
        setSelectedSlotId(slot.id);

        post(route('appointments.book'), {
            data: {
                doctor_profile_id: doctor.id,
                date: dateStr,
                availability_id: slot.id,
            },
            preserveScroll: true,
            onFinish: () => setSelectedSlotId(null),
        });
    };

    // Group availabilities by date
    const slotsByDate = (doctor.availabilities ?? []).reduce((acc, slot) => {
        const key = typeof slot.date === 'string' ? slot.date.substring(0, 10) : slot.date;
        if (!acc[key]) acc[key] = [];
        acc[key].push(slot);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Head title={`Dr. ${doctor.user.name} — NIDHAAN`} />
            <AppNavbar breadcrumbs={[
                { label: 'Our Doctors', href: route('doctors.index') },
                { label: `Dr. ${doctor.user.name}` }
            ]} />

            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

                {/* Doctor info card */}
                <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="flex h-24 w-24 md:h-32 md:w-32 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-4xl font-bold text-emerald-700">
                            {doctor.user.name.charAt(0)}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <h1 className="mb-1 text-2xl font-extrabold text-slate-900 md:text-3xl">
                                Dr. {doctor.user.name}
                            </h1>
                            <p className="mb-5 text-lg font-semibold text-emerald-600">{doctor.specialization}</p>

                            <div className="flex flex-wrap gap-3">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                                    <span className="block text-xs uppercase tracking-wider text-slate-400">Experience</span>
                                    <strong className="text-slate-800">{doctor.experience_years}+ Years</strong>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                                    <span className="block text-xs uppercase tracking-wider text-slate-400">Consultation Fee</span>
                                    <strong className="text-slate-800">₹{Number(doctor.consultation_fee).toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
                    <h2 className="mb-6 border-b border-slate-100 pb-4 text-xl font-bold text-slate-900">
                        Book an Appointment
                    </h2>

                    {!auth.user && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Please{' '}
                            <a href={route('login')} className="font-semibold underline hover:text-amber-900">log in</a>
                            {' '}to book an appointment.
                        </div>
                    )}

                    {Object.keys(slotsByDate).length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
                            <svg className="mb-3 h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-medium text-slate-500">No available slots at the moment.</p>
                            <p className="mt-1 text-sm text-slate-400">Please check back later.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(slotsByDate).map(([date, slots]) => (
                                <div key={date}>
                                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                                        {fmtDate(date)}
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {slots.map((slot) => {
                                            const isLoading = processing && selectedSlotId === slot.id;
                                            return (
                                                <button
                                                    key={slot.id}
                                                    id={`book-slot-${slot.id}`}
                                                    onClick={() => handleBook(slot)}
                                                    disabled={processing}
                                                    className={`
                                                        flex min-w-[130px] items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150
                                                        ${isLoading
                                                            ? 'cursor-not-allowed bg-emerald-100 text-emerald-800 opacity-70'
                                                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-600 hover:text-white'
                                                        }
                                                        disabled:cursor-not-allowed
                                                    `}
                                                >
                                                    {isLoading ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                            Booking…
                                                        </span>
                                                    ) : (
                                                        `${fmtTime(slot.start_time)} – ${fmtTime(slot.end_time)}`
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
