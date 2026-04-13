import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// Avatar — initials fallback (mirrors AuthenticatedLayout style)
// ---------------------------------------------------------------------------
function Avatar({ name }) {
    const initials = (name ?? 'D')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
    return (
        <span className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-2 ring-blue-200">
            {initials}
        </span>
    );
}

// ---------------------------------------------------------------------------
// A single nav link pill — highlights when URL matches
// ---------------------------------------------------------------------------
function NavItem({ href, icon, children }) {
    const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(href);
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150
                ${isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
        >
            {icon && (
                <svg className="h-4 w-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    {icon}
                </svg>
            )}
            {children}
        </Link>
    );
}

// ---------------------------------------------------------------------------
// Doctor Layout
// ---------------------------------------------------------------------------
export default function DoctorLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ================================================================
                TOP NAVBAR
            ================================================================ */}
            <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

                    {/* ── Brand ──────────────────────────────────────────── */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/doctor/dashboard"
                            className="flex items-center gap-2 text-lg font-bold tracking-tight text-blue-700"
                        >
                            {/* Stethoscope icon */}
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4a9 9 0 1118 0 9 9 0 01-18 0z" />
                            </svg>
                            Doctor Panel
                        </Link>

                        {/* Desktop nav links */}
                        <div className="hidden items-center gap-1 sm:flex">
                            <NavItem
                                href="/doctor/dashboard"
                                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                            >
                                Dashboard
                            </NavItem>
                            <NavItem
                                href="/doctor/appointments"
                                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                            >
                                Appointments
                            </NavItem>
                            <NavItem
                                href="/doctor/availability"
                                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                            >
                                Availability
                            </NavItem>
                        </div>
                    </div>

                    {/* ── Right: user + logout ────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <div className="hidden items-center gap-3 sm:flex">
                                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                                    <Avatar name={user.name} />
                                    <span className="max-w-[120px] truncate text-sm font-medium text-slate-700">
                                        {user.name}
                                    </span>
                                </div>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </Link>
                            </div>
                        )}

                        {/* Hamburger */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label="Toggle navigation"
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 sm:hidden"
                        >
                            {mobileOpen ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile drawer */}
                {mobileOpen && (
                    <div className="border-t border-slate-100 bg-white sm:hidden">
                        <div className="space-y-1 px-3 py-3">
                            <Link href="/doctor/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Dashboard</Link>
                            <Link href="/doctor/appointments" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Appointments</Link>
                            <Link href="/doctor/availability" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Availability</Link>
                        </div>
                        {user && (
                            <div className="border-t border-slate-100 px-4 py-3">
                                <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                                    <Avatar name={user.name} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                                        <p className="truncate text-xs text-slate-400">{user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                                >
                                    Log Out
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* ================================================================
                PAGE CONTENT
            ================================================================ */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}