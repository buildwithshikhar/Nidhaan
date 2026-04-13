import AppNavbar from '@/Components/AppNavbar';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// Doctor card
// ---------------------------------------------------------------------------
function DoctorCard({ doctor }) {
    const initial = doctor.user?.name?.charAt(0)?.toUpperCase() ?? 'D';
    const name    = doctor.user?.name ?? 'Unknown';
    const spec    = doctor.specialization ?? '—';
    const exp     = doctor.experience_years;
    const fee     = doctor.consultation_fee
        ? Number(doctor.consultation_fee).toFixed(0)
        : null;

    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-emerald-200 hover:shadow-lg">
            {/* Gradient header band */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 px-6 pt-6 pb-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-emerald-700 shadow-sm ring-2 ring-emerald-100">
                        {initial}
                    </div>
                    <div className="min-w-0 pt-0.5">
                        <h3 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                            Dr. {name}
                        </h3>
                        <p className="truncate text-sm font-semibold text-emerald-600">{spec}</p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col px-6 py-4">
                {/* Badges */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {exp && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {exp}+ yrs exp
                        </span>
                    )}
                    {fee && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            ₹{fee} / consult
                        </span>
                    )}
                </div>

                {/* Availability hint */}
                <p className="mb-5 flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    Available for online consultation
                </p>

                <Link
                    href={route('doctors.show', doctor.id)}
                    id={`view-doctor-${doctor.id}`}
                    className="mt-auto block w-full rounded-xl bg-slate-900 py-2.5 text-center text-sm font-bold text-white transition group-hover:bg-emerald-600"
                >
                    View Profile &amp; Book
                </Link>
            </div>
        </article>
    );
}

// ---------------------------------------------------------------------------
// Specialization filter pill
// ---------------------------------------------------------------------------
function FilterPill({ label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition
                ${active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
        >
            {label}
        </button>
    );
}

// ---------------------------------------------------------------------------
// Main Doctors listing page
// ---------------------------------------------------------------------------
export default function Index({ doctors }) {
    const { auth } = usePage().props;

    // Derive unique specializations for filtering
    const specs = ['All', ...new Set(doctors.map((d) => d.specialization).filter(Boolean))];
    const [filterSpec, setFilterSpec] = useState('All');

    const filtered = filterSpec === 'All'
        ? doctors
        : doctors.filter((d) => d.specialization === filterSpec);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Head title="Find a Doctor — NIDHAAN" />
            <AppNavbar breadcrumbs={[{ label: 'Our Doctors' }]} />

            <main>
                {/* ── Hero banner ──────────────────────────────────────── */}
                <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-4 py-14 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-100/80">
                            NIDHAAN Telemedicine
                        </p>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Consult Top Doctors Online
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-base text-emerald-50/90 sm:text-lg">
                            Find experienced specialists and book your teleconsultation slot instantly — from home.
                        </p>

                        {/* Trust pills */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            {['✓ Verified Doctors', '✓ Instant Booking', '✓ Secure & Private'].map((b) => (
                                <span key={b} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                                    {b}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Filters + Grid ───────────────────────────────────── */}
                <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {/* Top bar */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">
                            <strong className="font-bold text-slate-900">{filtered.length}</strong>
                            {' '}doctor{filtered.length !== 1 ? 's' : ''} available
                        </p>
                        {!auth?.user && (
                            <Link href={route('login')} className="text-sm font-semibold text-emerald-700 hover:underline">
                                Log in to book →
                            </Link>
                        )}
                    </div>

                    {/* Specialization filter pills */}
                    {specs.length > 2 && (
                        <div className="mb-7 -mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                            {specs.map((s) => (
                                <FilterPill
                                    key={s}
                                    label={s}
                                    active={filterSpec === s}
                                    onClick={() => setFilterSpec(s)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
                            <svg className="mb-4 h-14 w-14 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4a9 9 0 1118 0 9 9 0 01-18 0z" />
                            </svg>
                            <p className="text-lg font-semibold text-slate-500">No doctors found</p>
                            <p className="mt-1 text-sm text-slate-400">
                                {filterSpec !== 'All'
                                    ? `No ${filterSpec} specialists onboarded yet.`
                                    : 'No doctors are onboarded currently. Please check back soon.'}
                            </p>
                            {filterSpec !== 'All' && (
                                <button
                                    type="button"
                                    onClick={() => setFilterSpec('All')}
                                    className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filtered.map((doctor) => (
                                <DoctorCard key={doctor.id} doctor={doctor} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
                <p className="font-medium text-slate-700">NIDHAAN</p>
                <p className="mt-1">Pharmacy · Lab tests · Telemedicine</p>
            </footer>
        </div>
    );
}
