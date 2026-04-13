import AppNavbar from '@/Components/AppNavbar';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

// ---------------------------------------------------------------------------
// Order summary sidebar
// ---------------------------------------------------------------------------
function OrderSummary({ cart }) {
    const subtotal    = cart.total_price;
    const THRESHOLD   = 499;
    const deliveryFee = subtotal >= THRESHOLD ? 0 : 49;
    const total       = subtotal + deliveryFee;

    return (
        <aside className="sticky top-24 h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Order Summary</h2>

            <div className="mb-4 divide-y divide-slate-100">
                {cart.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 py-3">
                        {/* Pill icon */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">{item.product.name}</p>
                            {item.product.brand && <p className="text-xs text-slate-400">{item.product.brand}</p>}
                            <p className="text-xs text-slate-500">Qty {item.quantity} × {fmt(item.price)}</p>
                            {item.product.requires_prescription && (
                                <span className="mt-0.5 inline-block rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-600">Rx</span>
                            )}
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-slate-900">{fmt(item.line_total)}</p>
                    </div>
                ))}
            </div>

            <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between text-slate-600">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-slate-900">{fmt(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>Delivery</dt>
                    <dd className={deliveryFee === 0 ? 'font-medium text-emerald-600' : 'font-medium text-slate-900'}>
                        {deliveryFee === 0 ? 'Free' : fmt(deliveryFee)}
                    </dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                    <dt className="font-bold text-slate-900">Total</dt>
                    <dd className="text-lg font-bold text-emerald-700">{fmt(total)}</dd>
                </div>
            </dl>
        </aside>
    );
}

// ---------------------------------------------------------------------------
// Main checkout page
// ---------------------------------------------------------------------------
export default function CheckoutIndex({ cart }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        shipping_address: '',
        prescription: null,
    });

    const fileRef = useRef(null);

    // Show server-side flash errors
    useEffect(() => {
        if (flash?.error) alert(flash.error);
    }, [flash]);

    function handleSubmit(e) {
        e.preventDefault();
        post(route('checkout.store'), {
            forceFormData: true, // required for file uploads with Inertia
            preserveScroll: true,
        });
    }

    const isEmpty = !cart?.items?.length;
    const needsPrescription = cart?.requires_prescription;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Head title="Checkout — NIDHAAN" />

            <AppNavbar breadcrumbs={[{ label: 'Cart', href: route('cart.index') }, { label: 'Checkout' }]} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-2xl font-bold text-slate-900">Checkout</h1>

                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                        <p className="text-lg font-semibold text-slate-600">Your cart is empty.</p>
                        <Link href={route('home')} className="mt-4 text-sm font-medium text-emerald-700 hover:underline">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* ── Form ─────────────────────────────────── */}
                        <div className="space-y-6 lg:col-span-2">

                            {/* Global cart/order errors */}
                            {(errors.cart || errors.order || errors.stock) && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                                    {[errors.cart, errors.order, errors.stock]
                                        .flat()
                                        .filter(Boolean)
                                        .map((msg, i) => (
                                            <p key={i} className="text-sm text-rose-700">{msg}</p>
                                        ))}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                encType="multipart/form-data"
                                className="space-y-6"
                            >
                                {/* Shipping address */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-base font-bold text-slate-900">Shipping Address</h2>

                                    <label htmlFor="shipping_address" className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Full delivery address <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        id="shipping_address"
                                        rows={4}
                                        value={data.shipping_address}
                                        onChange={(e) => setData('shipping_address', e.target.value)}
                                        placeholder="House / flat no., street, area, city, state, PIN code"
                                        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                                            errors.shipping_address
                                                ? 'border-rose-400 focus:ring-rose-300'
                                                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                                        }`}
                                    />
                                    {errors.shipping_address && (
                                        <p className="mt-1.5 text-xs text-rose-600">{errors.shipping_address}</p>
                                    )}
                                </div>

                                {/* Prescription upload */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-1 flex items-center gap-2">
                                        <h2 className="text-base font-bold text-slate-900">Prescription Upload</h2>
                                        {needsPrescription ? (
                                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">Required</span>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Optional</span>
                                        )}
                                    </div>
                                    <p className="mb-4 text-xs text-slate-400">
                                        {needsPrescription
                                            ? 'One or more items in your cart require a valid prescription from a licensed doctor.'
                                            : 'Upload a prescription if your doctor has recommended any of these items.'}
                                    </p>

                                    {/* Drop zone */}
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition hover:bg-slate-50 ${
                                            errors.prescription
                                                ? 'border-rose-400 bg-rose-50'
                                                : data.prescription
                                                ? 'border-emerald-400 bg-emerald-50'
                                                : 'border-slate-200'
                                        }`}
                                    >
                                        {data.prescription ? (
                                            <>
                                                <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-sm font-medium text-emerald-700">{data.prescription.name}</p>
                                                <p className="text-xs text-slate-400">Click to replace</p>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm font-medium text-slate-600">Click to upload prescription</p>
                                                <p className="text-xs text-slate-400">JPG, PNG or PDF — max 5 MB</p>
                                            </>
                                        )}
                                    </button>

                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="hidden"
                                        onChange={(e) => setData('prescription', e.target.files[0] ?? null)}
                                    />

                                    {errors.prescription && (
                                        <p className="mt-2 text-xs text-rose-600">{errors.prescription}</p>
                                    )}
                                    {errors['prescription.0'] && (
                                        <p className="mt-2 text-xs text-rose-600">{errors['prescription.0']}</p>
                                    )}
                                </div>

                                {/* Prescription errors from service */}
                                {errors.prescription_service && (
                                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                                        {[].concat(errors.prescription_service).map((m, i) => (
                                            <p key={i} className="text-sm text-rose-700">{m}</p>
                                        ))}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Placing Order…
                                        </span>
                                    ) : (
                                        'Place Order'
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* ── Summary sidebar ───────────────────── */}
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
