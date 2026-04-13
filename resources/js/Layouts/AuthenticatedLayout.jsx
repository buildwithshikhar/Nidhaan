import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// Small avatar circle — shows initials when no photo is set
// ---------------------------------------------------------------------------
function Avatar({ name }) {
    const initials = (name ?? 'U')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');

    return (
        <span className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-sm ring-2 ring-emerald-200">
            {initials}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Main layout
// ---------------------------------------------------------------------------
export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;
    const roles = auth?.roles ?? [];
    const isDoctor = roles.includes('Doctor');

    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ================================================================
                NAV BAR
            ================================================================ */}
            <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between gap-6">

                        {/* ── Brand + primary links ──────────────────────── */}
                        <div className="flex items-center gap-6">
                            {/* Logo / wordmark */}
                            <Link
                                href={route('home')}
                                className="flex items-center gap-2 text-lg font-bold tracking-tight text-emerald-700"
                            >
                                <ApplicationLogo className="h-7 w-auto text-emerald-600" />
                                NIDHAAN
                            </Link>

                            {/* Desktop nav links — visible only when logged in */}
                            {user && (
                                <div className="hidden items-center gap-1 sm:flex">
                                    {isDoctor ? (
                                        /* Doctor-role nav */
                                        <>
                                            <NavLink
                                                href="/doctor/dashboard"
                                                active={typeof window !== 'undefined' && window.location.pathname.startsWith('/doctor/dashboard')}
                                                className="!border-0 rounded-lg px-3 py-1.5 text-sm"
                                            >
                                                Dashboard
                                            </NavLink>
                                            <NavLink
                                                href="/doctor/appointments"
                                                active={typeof window !== 'undefined' && window.location.pathname.startsWith('/doctor/appointments')}
                                                className="!border-0 rounded-lg px-3 py-1.5 text-sm"
                                            >
                                                Appointments
                                            </NavLink>
                                            <NavLink
                                                href="/doctor/availability"
                                                active={typeof window !== 'undefined' && window.location.pathname.startsWith('/doctor/availability')}
                                                className="!border-0 rounded-lg px-3 py-1.5 text-sm"
                                            >
                                                Availability
                                            </NavLink>
                                        </>
                                    ) : (
                                        /* Patient-role nav */
                                        <>
                                            <NavLink
                                                href={route('home')}
                                                active={route().current('home')}
                                                className="!border-0 rounded-lg px-3 py-1.5 text-sm"
                                            >
                                                Store
                                            </NavLink>
                                            <NavLink
                                                href={route('doctors.index')}
                                                active={route().current('doctors.index') || route().current('doctors.show')}
                                                className="!border-0 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700"
                                            >
                                                Doctors
                                            </NavLink>
                                            <NavLink
                                                href={route('cart.index')}
                                                active={route().current('cart.index')}
                                                className="!border-0 rounded-lg px-3 py-1.5 text-sm"
                                            >
                                                Cart
                                            </NavLink>
                                            <NavLink
                                                href={route('orders.index')}
                                                active={route().current('orders.index')}
                                                className="!border-0 rounded-lg px-3 py-1.5 text-sm"
                                            >
                                                My Orders
                                            </NavLink>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Right section ──────────────────────────────── */}
                        <div className="flex items-center gap-3">

                            {/* ── GUEST: Login / Register ─────────────────── */}
                            {!user && (
                                <div className="hidden items-center gap-2 sm:flex">
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}

                            {/* ── AUTHENTICATED: Account dropdown ─────────── */}
                            {user && (
                                <div className="hidden sm:block">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus:outline-none"
                                                id="account-menu-button"
                                                aria-haspopup="true"
                                            >
                                                <Avatar name={user.name} />
                                                <span className="max-w-[120px] truncate">{user.name}</span>
                                                <svg
                                                    className="h-4 w-4 text-slate-400 transition"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>

                                        {/* Dropdown panel */}
                                        <Dropdown.Content
                                            align="right"
                                            width="56"
                                            contentClasses="py-1 bg-white"
                                        >
                                            {/* User info header */}
                                            <div className="border-b border-slate-100 px-4 py-3">
                                                <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                                                <p className="truncate text-xs text-slate-400">{user.email}</p>
                                            </div>

                                            {isDoctor ? (
                                                /* Doctor dropdown links */
                                                <>
                                                    <Dropdown.Link href="/doctor/dashboard" className="flex items-center gap-2.5 text-slate-600">
                                                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                        Doctor Dashboard
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href="/doctor/appointments" className="flex items-center gap-2.5 text-slate-600">
                                                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        My Appointments
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href="/doctor/availability" className="flex items-center gap-2.5 text-slate-600">
                                                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Manage Availability
                                                    </Dropdown.Link>
                                                </>
                                            ) : (
                                                /* Patient dropdown links */
                                                <>
                                                    {/* My Orders */}
                                                    <Dropdown.Link
                                                        href={route('orders.index')}
                                                        className="flex items-center gap-2.5 text-slate-600"
                                                    >
                                                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        My Orders
                                                    </Dropdown.Link>

                                                    {/* Cart */}
                                                    <Dropdown.Link
                                                        href={route('cart.index')}
                                                        className="flex items-center gap-2.5 text-slate-600"
                                                    >
                                                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        Cart
                                                    </Dropdown.Link>

                                                    {/* Profile */}
                                                    <Dropdown.Link
                                                        href={route('profile.edit')}
                                                        className="flex items-center gap-2.5 text-slate-600"
                                                    >
                                                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Profile
                                                    </Dropdown.Link>
                                                </>
                                            )}

                                            {/* Divider */}
                                            <div className="my-1 border-t border-slate-100" />

                                            {/* Logout — POST via Inertia */}
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-2.5 text-rose-600 hover:bg-rose-50"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            )}

                            {/* ── Hamburger (mobile) ──────────────────────── */}
                            <button
                                type="button"
                                onClick={() => setMobileOpen((v) => !v)}
                                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 sm:hidden"
                                aria-label="Toggle navigation"
                                aria-expanded={mobileOpen}
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
                </div>

                {/* ================================================================
                    MOBILE DRAWER
                ================================================================ */}
                <div className={`border-t border-slate-100 bg-white sm:hidden ${mobileOpen ? 'block' : 'hidden'}`}>

                    {/* Primary nav links */}
                    <div className="space-y-0.5 px-2 py-2">
                        {user && isDoctor ? (
                            /* Doctor mobile links */
                            <>
                                <ResponsiveNavLink href="/doctor/dashboard">
                                    Dashboard
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/doctor/appointments">
                                    Appointments
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href="/doctor/availability">
                                    Availability
                                </ResponsiveNavLink>
                            </>
                        ) : (
                            /* Patient/Guest mobile links */
                            <>
                                <ResponsiveNavLink href={route('home')} active={route().current('home')}>
                                    <svg className="mr-2.5 h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Store
                                </ResponsiveNavLink>

                                <ResponsiveNavLink href={route('doctors.index')} active={route().current('doctors.index')}>
                                    <svg className="mr-2.5 h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4a9 9 0 1118 0 9 9 0 01-18 0z" />
                                    </svg>
                                    Doctors
                                </ResponsiveNavLink>

                                {user && (
                                    <>
                                        <ResponsiveNavLink href={route('cart.index')} active={route().current('cart.index')}>
                                            <svg className="mr-2.5 h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Cart
                                        </ResponsiveNavLink>

                                        <ResponsiveNavLink href={route('orders.index')} active={route().current('orders.index')}>
                                            <svg className="mr-2.5 h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            My Orders
                                        </ResponsiveNavLink>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── User section ─────────────────────────────────────── */}
                    {user ? (
                        <div className="border-t border-slate-100 px-2 pb-3 pt-3">
                            {/* User info */}
                            <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                                <Avatar name={user.name} />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                                </div>
                            </div>

                            {/* Profile */}
                            <ResponsiveNavLink href={route('profile.edit')} active={route().current('profile.edit')}>
                                <svg className="mr-2.5 h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Profile
                            </ResponsiveNavLink>

                            {/* Logout — POST via Inertia Link */}
                            <ResponsiveNavLink
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="mt-0.5 text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            >
                                <svg className="mr-2.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    ) : (
                        /* Guest CTA buttons in mobile drawer */
                        <div className="border-t border-slate-100 px-4 py-3 space-y-2">
                            <Link
                                href={route('login')}
                                className="block w-full rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="block w-full rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* ================================================================
                PAGE HEADER (optional slot)
            ================================================================ */}
            {header && (
                <header className="border-b border-slate-200 bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* ================================================================
                PAGE CONTENT
            ================================================================ */}
            <main>{children}</main>
        </div>
    );
}
