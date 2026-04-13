import DoctorLayout from '@/Layouts/DoctorLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

// Status badge
function StatusBadge({ status }) {
    const map = {
        pending:    'bg-amber-100 text-amber-800',
        confirmed:  'bg-blue-100 text-blue-800',
        completed:  'bg-emerald-100 text-emerald-800',
        cancelled:  'bg-red-100 text-red-800',
        processing: 'bg-purple-100 text-purple-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-slate-100 text-slate-700'}`}>
            {status}
        </span>
    );
}

export default function Appointments({ appointments }) {
    const [loadingId, setLoadingId] = useState(null);

    const updateStatus = (id, status) => {
        setLoadingId(`${id}-${status}`);
        router.put(
            route('doctor.appointments.updateStatus', id),
            { status },
            {
                preserveScroll: true,
                onFinish: () => setLoadingId(null),
            }
        );
    };

    return (
        <DoctorLayout>
            <Head title="Appointments — Doctor Panel" />

            {/* Page header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Appointments</h1>
                    <p className="mt-1 text-sm text-slate-500">View and manage all patient bookings.</p>
                </div>
                <span className="rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
                    {appointments.length} Total
                </span>
            </div>

            {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                    <svg className="mb-4 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-500 font-medium">No appointments yet</p>
                    <p className="mt-1 text-sm text-slate-400">Patients who book with you will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appt) => (
                        <div
                            key={appt.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                {/* Patient info */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
                                        {appt.user?.name?.charAt(0) ?? '?'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {appt.user?.name ?? 'Unknown Patient'}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            {appt.appointment_date
                                                ? new Date(appt.appointment_date).toLocaleDateString('en-IN', {
                                                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                                })
                                                : '—'}
                                            {' · '}
                                            {appt.time_slot}
                                        </p>
                                    </div>
                                </div>

                                {/* Status + actions */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <StatusBadge status={appt.status} />

                                    {appt.status === 'pending' && (
                                        <button
                                            id={`confirm-appt-${appt.id}`}
                                            onClick={() => updateStatus(appt.id, 'processing')}
                                            disabled={loadingId !== null}
                                            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            {loadingId === `${appt.id}-processing` ? 'Confirming…' : 'Confirm'}
                                        </button>
                                    )}

                                    {appt.status === 'processing' && (
                                        <button
                                            id={`complete-appt-${appt.id}`}
                                            onClick={() => updateStatus(appt.id, 'completed')}
                                            disabled={loadingId !== null}
                                            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                                        >
                                            {loadingId === `${appt.id}-completed` ? 'Saving…' : 'Mark Complete'}
                                        </button>
                                    )}

                                    {!['completed', 'cancelled'].includes(appt.status) && (
                                        <button
                                            id={`cancel-appt-${appt.id}`}
                                            onClick={() => updateStatus(appt.id, 'cancelled')}
                                            disabled={loadingId !== null}
                                            className="rounded-lg border border-red-200 px-4 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                        >
                                            {loadingId === `${appt.id}-cancelled` ? 'Cancelling…' : 'Cancel'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DoctorLayout>
    );
}