import AppNavbar from '@/Components/AppNavbar';
import { Head, Link, usePage } from '@inertiajs/react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const STATUS_PIPELINE = [
    {
        key:   'pending',
        label: 'Order Placed',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
    },
    {
        key:   'processing',
        label: 'Processing',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        ),
    },
    {
        key:   'shipped',
        label: 'Shipped',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 004 0m-4 0a2 2 0 014 0m6 0a2 2 0 004 0m-4 0a2 2 0 014 0" />
            </svg>
        ),
    },
    {
        key:   'delivered',
        label: 'Delivered',
        icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

const STATUS_META = {
    pending:    { badgeCls: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',     activeCls: 'bg-amber-500',   connCls: 'bg-amber-300'   },
    processing: { badgeCls: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',        activeCls: 'bg-blue-500',    connCls: 'bg-blue-300'    },
    shipped:    { badgeCls: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',  activeCls: 'bg-violet-500',  connCls: 'bg-violet-300'  },
    delivered:  { badgeCls: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200', activeCls: 'bg-emerald-500', connCls: 'bg-emerald-300' },
};

// ---------------------------------------------------------------------------
// Status Progress Stepper
// ---------------------------------------------------------------------------
function StatusStepper({ status }) {
    const currentIdx = STATUS_PIPELINE.findIndex((s) => s.key === status);
    const meta = STATUS_META[status] ?? STATUS_META.pending;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-400">
                Order Status
            </h2>

            {/* Desktop / tablet stepper */}
            <div className="hidden sm:flex sm:items-start">
                {STATUS_PIPELINE.map((step, i) => {
                    const done    = i <= currentIdx;
                    const isNow   = i === currentIdx;
                    const isLast  = i === STATUS_PIPELINE.length - 1;
                    const stepMeta = STATUS_META[step.key];

                    return (
                        <div key={step.key} className="flex flex-1 flex-col items-center">
                            {/* Node + connector row */}
                            <div className="flex w-full items-center">
                                {/* Circle */}
                                <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all ${
                                    done
                                        ? isNow
                                            ? `${stepMeta.activeCls} shadow-lg ring-4 ring-offset-2 ring-${step.key === 'delivered' ? 'emerald' : step.key === 'shipped' ? 'violet' : step.key === 'processing' ? 'blue' : 'amber'}-200`
                                            : 'bg-emerald-500'
                                        : 'bg-slate-100'
                                }`}>
                                    <span className={`h-5 w-5 ${done ? 'text-white' : 'text-slate-300'}`}>
                                        {done && !isNow ? (
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            step.icon
                                        )}
                                    </span>
                                    {isNow && (
                                        <span className={`absolute -inset-1 animate-ping rounded-full opacity-20 ${stepMeta.activeCls}`} />
                                    )}
                                </div>

                                {/* Connector line */}
                                {!isLast && (
                                    <div className={`h-0.5 flex-1 transition-all ${i < currentIdx ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                                )}
                            </div>

                            {/* Label */}
                            <p className={`mt-2 text-center text-xs font-semibold ${isNow ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-300'}`}>
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Mobile vertical stepper */}
            <div className="flex flex-col gap-0 sm:hidden">
                {STATUS_PIPELINE.map((step, i) => {
                    const done   = i <= currentIdx;
                    const isNow  = i === currentIdx;
                    const isLast = i === STATUS_PIPELINE.length - 1;
                    const stepMeta = STATUS_META[step.key];

                    return (
                        <div key={step.key} className="flex items-start gap-3">
                            {/* Left column: circle + vertical line */}
                            <div className="flex flex-col items-center">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                    done ? (isNow ? stepMeta.activeCls : 'bg-emerald-500') : 'bg-slate-100'
                                }`}>
                                    <span className={`h-4 w-4 ${done ? 'text-white' : 'text-slate-300'}`}>
                                        {done && !isNow ? (
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            step.icon
                                        )}
                                    </span>
                                </div>
                                {!isLast && (
                                    <div className={`mt-1 w-0.5 flex-1 self-stretch ${i < currentIdx ? 'bg-emerald-300' : 'bg-slate-100'}`} style={{ minHeight: '24px' }} />
                                )}
                            </div>

                            {/* Right: label */}
                            <p className={`pt-1.5 text-sm font-semibold ${isNow ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-300'}`}>
                                {step.label}
                                {isNow && <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">← Now</span>}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Order detail page
// ---------------------------------------------------------------------------
export default function OrderShow({ order }) {
    const { flash } = usePage().props;
    const meta = STATUS_META[order.status] ?? STATUS_META.pending;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Head title={`Order #${order.id} — NIDHAAN`} />

            <AppNavbar
                breadcrumbs={[
                    { label: 'My Orders', href: route('orders.index') },
                    { label: `Order #${order.id}` },
                ]}
            />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Success / confirmation banner ─────────────────────── */}
                {flash?.success && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-emerald-900">Order confirmed! 🎉</p>
                            <p className="mt-0.5 text-sm text-emerald-700">{flash.success}</p>
                        </div>
                    </div>
                )}

                {/* ── Status stepper ────────────────────────────────────── */}
                <StatusStepper status={order.status} />

                {/* ── Order meta ────────────────────────────────────────── */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Order #{order.id}</h1>
                            <p className="mt-0.5 text-sm text-slate-400">Placed on {order.created_at}</p>
                        </div>

                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest ${meta.badgeCls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.activeCls}`} />
                            {order.status_label}
                        </span>
                    </div>

                    {/* Shipping + prescription grid */}
                    <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                        <div>
                            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Shipping Address
                            </p>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{order.shipping_address}</p>
                        </div>

                        {order.prescription_url ? (
                            <div>
                                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Prescription
                                </p>
                                <a
                                    href={order.prescription_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    View Prescription
                                </a>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-4">
                                <p className="text-xs text-slate-300">No prescription attached</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Items ─────────────────────────────────────────────── */}
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h2 className="text-base font-bold text-slate-900">
                            Items
                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                                {order.items.length}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400">Unit price (snapshot at order time)</p>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50">
                                {/* Icon */}
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100">
                                    <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-900">{item.product?.name ?? '—'}</p>
                                    {item.product?.brand && (
                                        <p className="text-xs text-slate-400">{item.product.brand}</p>
                                    )}
                                </div>

                                {/* Qty & price */}
                                <div className="hidden text-right sm:block">
                                    <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                                    <p className="text-xs text-slate-400">× {fmt(item.price)}</p>
                                </div>

                                {/* Line total */}
                                <p className="shrink-0 text-base font-bold text-slate-900">{fmt(item.line_total)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Total footer */}
                    <div className="flex items-center justify-between border-t border-slate-100 bg-gradient-to-r from-slate-50 to-emerald-50 px-6 py-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Order Total</p>
                            <p className="text-xs text-slate-400">Including all items</p>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700">{fmt(order.total_amount)}</p>
                    </div>
                </div>

                {/* ── CTAs ──────────────────────────────────────────────── */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href={route('home')}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Continue Shopping
                    </Link>
                    <Link
                        href={route('orders.index')}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        All My Orders
                    </Link>
                </div>
            </main>

            <footer className="mt-8 border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
                <p className="font-semibold text-slate-600">NIDHAAN</p>
                <p className="mt-1">Pharmacy · Lab tests · Telemedicine</p>
            </footer>
        </div>
    );
}
