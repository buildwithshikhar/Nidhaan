import AppNavbar from '@/Components/AppNavbar';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

const STATUS_PIPELINE = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_META = {
    pending:    { colour: 'amber',   label: 'Pending',    badgeCls: 'bg-amber-100 text-amber-700 ring-amber-200',   dot: 'bg-amber-400'   },
    processing: { colour: 'blue',    label: 'Processing', badgeCls: 'bg-blue-100 text-blue-700 ring-blue-200',      dot: 'bg-blue-400'    },
    shipped:    { colour: 'violet',  label: 'Shipped',    badgeCls: 'bg-violet-100 text-violet-700 ring-violet-200', dot: 'bg-violet-400'  },
    delivered:  { colour: 'emerald', label: 'Delivered',  badgeCls: 'bg-emerald-100 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-400' },
};

// Derive from backend colour token OR raw status string
function resolveStatus(order) {
    return STATUS_META[order.status] ?? STATUS_META.pending;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
function StatusBadge({ order }) {
    const meta = resolveStatus(order);
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ring-1 ${meta.badgeCls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {order.status_label ?? meta.label}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
function useToast() {
    const [toasts, setToasts] = useState([]);
    const push = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToasts((p) => [...p, { id, msg, type }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    }, []);
    return { toasts, push };
}

function Toasts({ toasts }) {
    return (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`animate-slide-in pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
                        t.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                >
                    <span>{t.type === 'error' ? '✕' : '✓'}</span>
                    {t.msg}
                </div>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Role-gated status updater
// ---------------------------------------------------------------------------
const NEXT_STATUS = {
    pending:    'processing',
    processing: 'shipped',
    shipped:    'delivered',
};

function StatusUpdater({ order, onSuccess, onError }) {
    const { data, setData, put, processing, errors } = useForm({ status: '' });
    const nextVal = NEXT_STATUS[order.status];

    if (!nextVal) return null; // delivered = terminal

    function handleUpdate(e) {
        e.preventDefault();
        put(route('orders.updateStatus', { order: order.id }), {
            preserveScroll: true,
            data: { status: nextVal },
            onSuccess: () => onSuccess(`Order #${order.id} → ${STATUS_META[nextVal]?.label}`),
            onError:   (errs) => onError(errs?.status || 'Could not update status.'),
        });
    }

    const nextMeta = STATUS_META[nextVal];

    return (
        <form onSubmit={handleUpdate} className="flex items-center gap-2">
            <button
                type="submit"
                disabled={processing}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50 ${
                    nextMeta?.colour === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    nextMeta?.colour === 'blue'    ? 'bg-blue-600 hover:bg-blue-700' :
                    nextMeta?.colour === 'violet'  ? 'bg-violet-600 hover:bg-violet-700' :
                                                     'bg-slate-600 hover:bg-slate-700'
                }`}
            >
                {processing ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                )}
                Move to {nextMeta?.label}
            </button>
            {errors?.status && <p className="text-xs text-rose-600">{errors.status}</p>}
        </form>
    );
}

// ---------------------------------------------------------------------------
// Order card
// ---------------------------------------------------------------------------
function OrderCard({ order, canManage, onSuccess, onError }) {
    const meta = resolveStatus(order);
    const progressIndex = STATUS_PIPELINE.indexOf(order.status);

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
            {/* Coloured left accent bar */}
            <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${meta.dot}`} />

            <div className="pl-4">
                {/* ── Card header ─────────────────────────────────────── */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5">
                            <Link
                                href={route('orders.show', order.id)}
                                className="text-base font-bold text-slate-900 transition hover:text-emerald-700"
                            >
                                Order #{order.id}
                            </Link>
                            <StatusBadge order={order} />
                        </div>
                        <p className="text-xs text-slate-400">{order.created_at}</p>
                    </div>

                    <div className="text-right">
                        <p className="text-xl font-bold text-emerald-700">{fmt(order.total_amount)}</p>
                        <p className="text-xs text-slate-400">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* ── Mini progress bar ────────────────────────────────── */}
                <div className="flex items-center gap-0 px-4 py-3 sm:px-5">
                    {STATUS_PIPELINE.map((s, i) => {
                        const done  = i <= progressIndex;
                        const isNow = i === progressIndex;
                        return (
                            <div key={s} className="flex flex-1 items-center">
                                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-all ${
                                    done
                                        ? isNow
                                            ? `${meta.dot} text-white ring-2 ring-offset-1 ring-${meta.colour}-300`
                                            : 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 text-slate-300'
                                }`}>
                                    {done && !isNow ? (
                                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                {i < STATUS_PIPELINE.length - 1 && (
                                    <div className={`h-0.5 flex-1 transition-all ${i < progressIndex ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Items preview ────────────────────────────────────── */}
                <div className="divide-y divide-slate-50 px-4 sm:px-5">
                    {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-teal-100">
                                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">{item.product?.name ?? '—'}</p>
                                <p className="text-xs text-slate-400">Qty {item.quantity} × {fmt(item.price)}</p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-slate-700">{fmt(item.line_total)}</p>
                        </div>
                    ))}
                    {order.items_count > 3 && (
                        <p className="py-2 text-xs text-slate-400">
                            +{order.items_count - 3} more item{order.items_count - 3 !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* ── Card footer ─────────────────────────────────────── */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5">
                    {canManage ? (
                        <StatusUpdater order={order} onSuccess={onSuccess} onError={onError} />
                    ) : (
                        <span /> // spacer
                    )}
                    <Link
                        href={route('orders.show', order.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 transition hover:gap-2"
                    >
                        View details
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </article>
    );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyOrders() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                <svg className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-700">No orders yet</h2>
            <p className="mt-2 max-w-xs text-sm text-slate-400">
                Once you place an order, it will appear here with live status tracking.
            </p>
            <Link
                href={route('home')}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Start Shopping
            </Link>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OrdersIndex({ orders }) {
    const { auth, flash } = usePage().props;
    const { toasts, push: pushToast } = useToast();

    const isAdmin      = auth?.user?.roles?.some((r) => r.name === 'SuperAdmin');
    const isPharmacist = auth?.user?.roles?.some((r) => r.name === 'Pharmacist');
    const isDelivery   = auth?.user?.roles?.some((r) => r.name === 'DeliveryAgent');
    const canManage    = isAdmin || isPharmacist || isDelivery;

    useEffect(() => {
        if (flash?.success) pushToast(flash.success, 'success');
        if (flash?.error)   pushToast(flash.error,   'error');
    }, [flash]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Head title="My Orders — NIDHAAN" />

            <style>{`
                @keyframes slide-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .animate-slide-in { animation: slide-in 0.22s ease-out; }
            `}</style>

            <Toasts toasts={toasts} />

            <AppNavbar breadcrumbs={[{ label: 'My Orders' }]} />

            {/* ── Page ───────────────────────────────────────────────────── */}
            <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

                {/* Page title row */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
                        {orders.length > 0 && (
                            <p className="mt-0.5 text-sm text-slate-400">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
                        )}
                    </div>
                    <Link
                        href={route('home')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Order
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <EmptyOrders />
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                canManage={canManage}
                                onSuccess={(msg) => pushToast(msg, 'success')}
                                onError={(msg)   => pushToast(msg, 'error')}
                            />
                        ))}
                    </div>
                )}
            </main>

            <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
                <p className="font-semibold text-slate-600">NIDHAAN</p>
                <p className="mt-1">Pharmacy · Lab tests · Telemedicine</p>
            </footer>
        </div>
    );
}
