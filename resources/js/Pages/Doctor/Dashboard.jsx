import DoctorLayout from '@/Layouts/DoctorLayout';
import { Head, Link, usePage } from '@inertiajs/react';

// Stat card component
function StatCard({ label, value, color, icon }) {
    const colorMap = {
        blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-100',   iconBg: 'bg-blue-100'   },
        yellow: { bg: 'bg-amber-50',  text: 'text-amber-700',  ring: 'ring-amber-100',  iconBg: 'bg-amber-100'  },
        green:  { bg: 'bg-emerald-50',text: 'text-emerald-700',ring: 'ring-emerald-100',iconBg: 'bg-emerald-100'},
    };
    const c = colorMap[color] ?? colorMap.blue;

    return (
        <div className={`${c.bg} ring-1 ${c.ring} rounded-2xl p-6 flex items-center gap-5`}>
            <div className={`${c.iconBg} h-14 w-14 rounded-xl flex items-center justify-center shrink-0`}>
                <svg className={`h-7 w-7 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    {icon}
                </svg>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className={`text-4xl font-extrabold tracking-tight ${c.text}`}>{value ?? 0}</p>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { total, pending, completed } = usePage().props;
    const { auth } = usePage().props;

    return (
        <DoctorLayout>
            <Head title="Doctor Dashboard — NIDHAAN" />

            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    Welcome back, Dr. {auth?.user?.name ?? 'Doctor'} 👋
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Here's an overview of your appointments today.
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
                <StatCard
                    label="Total Appointments"
                    value={total}
                    color="blue"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                />
                <StatCard
                    label="Pending"
                    value={pending}
                    color="yellow"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                />
                <StatCard
                    label="Completed"
                    value={completed}
                    color="green"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* CTA — View Appointments */}
                <Link
                    href="/doctor/appointments"
                    id="view-appointments-btn"
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition">View Appointments</p>
                        <p className="text-sm text-slate-400">Manage all patient bookings</p>
                    </div>
                    <svg className="ml-auto h-5 w-5 text-slate-300 group-hover:text-blue-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>

                {/* CTA — Manage Availability */}
                <Link
                    href="/doctor/availability"
                    id="manage-availability-btn"
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition">
                        <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition">Manage Availability</p>
                        <p className="text-sm text-slate-400">Set your open time slots</p>
                    </div>
                    <svg className="ml-auto h-5 w-5 text-slate-300 group-hover:text-emerald-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </DoctorLayout>
    );
}