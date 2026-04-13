import AppNavbar from '@/Components/AppNavbar';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
function useToast() {
    const [toasts, setToasts] = useState([]);
    const push = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToasts((p) => [...p, { id, msg, type }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
    }, []);
    return { toasts, push };
}

function Toasts({ toasts }) {
    return (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`animate-slide-in pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
                        t.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                >
                    {t.type === 'error' ? '✕' : '✓'} {t.msg}
                </div>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Single cart row
// ---------------------------------------------------------------------------
function CartRow({ item, onRemoved, onUpdated, onError }) {
    // ── quantity form ──
    const qtyForm = useForm({
        cart_item_id: item.id,
        quantity: item.quantity,
    });

    // ── remove form ──
    const removeForm = useForm({});

    const debounceRef = useRef(null);

    function handleQtyChange(next) {
        next = Math.max(1, next);
        qtyForm.setData('quantity', next);

        // Debounce the PUT so fast clicks don't flood the server
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            qtyForm.put('/cart/update', {
                preserveScroll: true,
                onSuccess: () => onUpdated(`Quantity updated.`),
                onError: (errs) => onError(errs?.quantity || 'Update failed.'),
            });
        }, 400);
    }

    function handleRemove() {
        removeForm.delete(`/cart/remove/${item.id}`, {
            preserveScroll: true,
            onSuccess: () => onRemoved(`"${item.product?.name}" removed.`),
            onError: () => onError('Could not remove item.'),
        });
    }

    const lineTotal = qtyForm.data.quantity * item.price;
    const busy = qtyForm.processing || removeForm.processing;

    return (
        <div
            className={`group relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition sm:flex-row sm:items-center sm:p-5 ${
                busy ? 'opacity-60' : ''
            }`}
        >
            {/* Product image placeholder */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 sm:h-24 sm:w-24">
                <svg
                    className="h-8 w-8 text-emerald-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    aria-hidden
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                </svg>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-1">
                <p className="text-base font-semibold text-slate-900">
                    {item.product?.name ?? 'Unknown product'}
                </p>
                {item.product?.brand && (
                    <p className="text-xs text-slate-400">{item.product.brand}</p>
                )}
                <p className="text-sm text-slate-500">
                    Unit price:{' '}
                    <span className="font-medium text-slate-700">{fmt(item.price)}</span>
                </p>

                {/* Quantity stepper */}
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Qty</span>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                        <button
                            type="button"
                            onClick={() => handleQtyChange(qtyForm.data.quantity - 1)}
                            disabled={qtyForm.data.quantity <= 1 || busy}
                            className="flex h-8 w-8 items-center justify-center rounded-l-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-bold text-slate-800">
                            {qtyForm.data.quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleQtyChange(qtyForm.data.quantity + 1)}
                            disabled={busy}
                            className="flex h-8 w-8 items-center justify-center rounded-r-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>

                    {qtyForm.processing && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    )}
                </div>

                {/* Validation error */}
                {qtyForm.errors?.quantity && (
                    <p className="mt-1 text-xs text-rose-600">{qtyForm.errors.quantity}</p>
                )}
            </div>

            {/* Line total + remove */}
            <div className="flex shrink-0 flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                <p className="text-lg font-bold text-emerald-700">{fmt(lineTotal)}</p>

                <button
                    type="button"
                    onClick={handleRemove}
                    disabled={busy}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {removeForm.processing ? 'Removing…' : 'Remove'}
                </button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <svg
                className="mx-auto h-16 w-16 text-slate-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1"
                aria-hidden
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
            </svg>
            <h2 className="mt-5 text-xl font-semibold text-slate-700">Your cart is empty</h2>
            <p className="mt-2 text-sm text-slate-400">
                Browse our store and add medicines to your cart.
            </p>
            <Link
                href={route('home')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
            </Link>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Order summary sidebar
// ---------------------------------------------------------------------------
function OrderSummary({ cart }) {
    const subtotal = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const DELIVERY_THRESHOLD = 499;
    const deliveryFee = subtotal >= DELIVERY_THRESHOLD ? 0 : 49;
    const total = subtotal + deliveryFee;

    return (
        <aside className="sticky top-24 h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Order Summary</h2>

            <dl className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                    <dt>
                        Subtotal ({cart.total_items} item{cart.total_items !== 1 ? 's' : ''})
                    </dt>
                    <dd className="font-medium text-slate-900">{fmt(subtotal)}</dd>
                </div>

                <div className="flex justify-between text-slate-600">
                    <dt>Delivery</dt>
                    <dd className={deliveryFee === 0 ? 'font-medium text-emerald-600' : 'font-medium text-slate-900'}>
                        {deliveryFee === 0 ? 'Free' : fmt(deliveryFee)}
                    </dd>
                </div>

                {deliveryFee > 0 && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Add {fmt(DELIVERY_THRESHOLD - subtotal)} more for free delivery
                    </p>
                )}

                <div className="border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                        <dt className="font-bold text-slate-900">Total</dt>
                        <dd className="text-lg font-bold text-emerald-700">{fmt(total)}</dd>
                    </div>
                </div>
            </dl>

            <Link
                href={route('checkout.index')}
                className="mt-6 block w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
            >
                Proceed to Checkout
            </Link>

            <Link
                href={route('home')}
                className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
            </Link>
        </aside>
    );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function CartIndex({ cart }) {
    const { flash } = usePage().props;
    const { toasts, push: pushToast } = useToast();

    // Show backend flash messages
    useEffect(() => {
        if (flash?.success) pushToast(flash.success, 'success');
        if (flash?.error)   pushToast(flash.error,   'error');
    }, [flash]);

    const hasItems = cart?.items?.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Head title="My Cart — NIDHAAN" />

            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in { animation: slide-in 0.2s ease-out; }
            `}</style>

            <Toasts toasts={toasts} />

            <AppNavbar breadcrumbs={[{ label: 'My Cart' }]} />

            {/* ── Page content ─────────────────────────────────────────── */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-slate-900">
                    {hasItems ? `My Cart (${cart.total_items} item${cart.total_items !== 1 ? 's' : ''})` : 'My Cart'}
                </h1>

                {!hasItems ? (
                    <EmptyCart />
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Cart items */}
                        <div className="space-y-4 lg:col-span-2">
                            {cart.items.map((item) => (
                                <CartRow
                                    key={item.id}
                                    item={item}
                                    onRemoved={(msg) => pushToast(msg, 'success')}
                                    onUpdated={(msg) => pushToast(msg, 'success')}
                                    onError={(msg)   => pushToast(msg, 'error')}
                                />
                            ))}
                        </div>

                        {/* Order summary */}
                        <OrderSummary cart={cart} />
                    </div>
                )}
            </main>

            <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
                <p className="font-medium text-slate-700">NIDHAAN</p>
                <p className="mt-1">Pharmacy · Lab tests · Telemedicine</p>
            </footer>
        </div>
    );
}
