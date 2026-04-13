/**
 * AppNavbar — shared auth-aware navbar used across all NIDHAAN patient/public pages.
 *
 * Props:
 *  - breadcrumbs?  [{ label, href? }]  items after the NIDHAAN wordmark
 *  - actions?      ReactNode           injected between breadcrumbs and the auth section
 *                                      (e.g. the Store search bar)
 *
 * Role-based visibility:
 *  - Doctors see: Dashboard link only (no Store / Cart / Orders)
 *  - Patients/Guests see: Store · Doctors · Cart · My Orders
 */
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// Avatar — initials fallback
// ---------------------------------------------------------------------------
function Avatar({ name }) {
    const initials = (name ?? 'U')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
    return (
        <span className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white ring-2 ring-emerald-200">
            {initials}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Account dropdown (authenticated) — role-aware
// ---------------------------------------------------------------------------
function AccountDropdown({ user, isDoctor }) {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    id="account-menu-button"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus:outline-none"
                    aria-haspopup="true"
                >
                    <Avatar name={user.name} />
                    <span className="hidden max-w-[110px] truncate sm:block">{user.name}</span>
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-white min-w-[15rem]">
                {/* User info header */}
                <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                    {isDoctor && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            Doctor
                        </span>
                    )}
                </div>

                {isDoctor ? (
                    /* Doctor-only dropdown items */
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
                    /* Patient dropdown items */
                    <>
                        <Dropdown.Link href={route('orders.index')} className="flex items-center gap-2.5 text-slate-600">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            My Orders
                        </Dropdown.Link>
                        <Dropdown.Link href={route('cart.index')} className="flex items-center gap-2.5 text-slate-600">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Cart
                        </Dropdown.Link>
                        <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2.5 text-slate-600">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                        </Dropdown.Link>
                    </>
                )}

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
    );
}

// ---------------------------------------------------------------------------
// Mobile drawer — role-aware
// ---------------------------------------------------------------------------
function MobileDrawer({ user, isDoctor, open }) {
    if (!open) return null;

    return (
        <div className="border-t border-slate-100 bg-white sm:hidden">
            <div className="space-y-0.5 px-3 py-2">
                {isDoctor ? (
                    /* Doctor mobile links */
                    <>
                        <MobileLink href="/doctor/dashboard" icon="dashboard">Doctor Dashboard</MobileLink>
                        <MobileLink href="/doctor/appointments" icon="calendar">Appointments</MobileLink>
                        <MobileLink href="/doctor/availability" icon="clock">Manage Availability</MobileLink>
                    </>
                ) : (
                    /* Patient/Guest mobile links */
                    <>
                        <MobileLink href={route('home')} icon="store">Store</MobileLink>
                        <MobileLink href={route('doctors.index')} icon="stethoscope">Doctors</MobileLink>
                        {user && (
                            <>
                                <MobileLink href={route('cart.index')} icon="cart">Cart</MobileLink>
                                <MobileLink href={route('orders.index')} icon="orders">My Orders</MobileLink>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Auth section */}
            <div className="border-t border-slate-100 px-3 py-3">
                {user ? (
                    <>
                        <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                            <Avatar name={user.name} />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                                <p className="truncate text-xs text-slate-400">{user.email}</p>
                            </div>
                        </div>
                        {!isDoctor && (
                            <MobileLink href={route('profile.edit')} icon="profile">Profile</MobileLink>
                        )}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            id="mobile-logout-btn"
                            className="mt-1 flex w-full items-center gap-3 rounded-lg border-l-4 border-transparent py-2 ps-3 pe-4 text-base font-medium text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log Out
                        </Link>
                    </>
                ) : (
                    <div className="space-y-2">
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
                            Create Account
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Icon map for mobile links
// ---------------------------------------------------------------------------
const ICONS = {
    store:       <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
    stethoscope: <><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
    cart:        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
    orders:      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    profile:     <><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></>,
    dashboard:   <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    calendar:    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    clock:       <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
};

function MobileLink({ href, icon, children }) {
    return (
        <Link
            href={href}
            className="flex w-full items-center gap-3 rounded-lg border-l-4 border-transparent py-2 ps-3 pe-4 text-base font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
        >
            <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {ICONS[icon]}
            </svg>
            {children}
        </Link>
    );
}

// ---------------------------------------------------------------------------
// AppNavbar (exported) — role-aware
// ---------------------------------------------------------------------------
export default function AppNavbar({ breadcrumbs = [], actions = null }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;
    const roles = auth?.roles ?? [];
    const isDoctor = roles.includes('Doctor');
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
            {/* ── Main bar ───────────────────────────────────────────────── */}
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">

                {/* Brand */}
                <Link
                    href={route('home')}
                    className="shrink-0 text-lg font-bold tracking-tight text-emerald-700"
                >
                    NIDHAAN
                </Link>

                {/* Breadcrumbs */}
                {breadcrumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-2">
                        <span className="text-slate-300">/</span>
                        {crumb.href ? (
                            <Link href={crumb.href} className="text-sm font-medium text-slate-500 transition hover:text-emerald-700">
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="text-sm font-semibold text-slate-700">{crumb.label}</span>
                        )}
                    </span>
                ))}

                {/* Injected slot (e.g. search bar) */}
                {actions && <div className="flex-1">{actions}</div>}
                {!actions && <div className="flex-1" />}

                {/* ── Auth + nav (desktop) ────────────────────────────────── */}
                <div className="flex shrink-0 items-center gap-2">
                    {user ? (
                        <>
                            {/* Role-aware desktop nav chips */}
                            <nav className="mr-1 hidden items-center gap-1 md:flex">
                                {isDoctor ? (
                                    /* Doctor desktop links */
                                    <>
                                        <NavChip href="/doctor/dashboard" label="Dashboard" />
                                        <NavChip href="/doctor/appointments" label="Appointments" />
                                        <NavChip href="/doctor/availability" label="Availability" />
                                    </>
                                ) : (
                                    /* Patient desktop links */
                                    <>
                                        <NavChip href={route('home')} label="Store" />
                                        <NavChip href={route('doctors.index')} label="Doctors" highlight />
                                        <NavChip href={route('cart.index')} label="Cart" />
                                        <NavChip href={route('orders.index')} label="My Orders" />
                                    </>
                                )}
                            </nav>
                            <AccountDropdown user={user} isDoctor={isDoctor} />
                        </>
                    ) : (
                        /* Guest: show nav + CTA */
                        <>
                            <nav className="mr-1 hidden items-center gap-1 md:flex">
                                <NavChip href={route('home')} label="Store" />
                                <NavChip href={route('doctors.index')} label="Doctors" highlight />
                            </nav>
                            <div className="hidden items-center gap-2 sm:flex">
                                <Link
                                    href={route('login')}
                                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
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
                        </>
                    )}

                    {/* Hamburger */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle navigation"
                        aria-expanded={mobileOpen}
                        className="flex items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 sm:hidden"
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

            {/* ── Mobile drawer ──────────────────────────────────────────── */}
            <MobileDrawer user={user} isDoctor={isDoctor} open={mobileOpen} />
        </header>
    );
}

// Small pill nav link for desktop
function NavChip({ href, label, highlight = false }) {
    const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(href) && href !== '/';
    return (
        <Link
            href={href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition
                ${isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : highlight
                        ? 'text-emerald-700 hover:bg-emerald-50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
                }`}
        >
            {label}
        </Link>
    );
}
