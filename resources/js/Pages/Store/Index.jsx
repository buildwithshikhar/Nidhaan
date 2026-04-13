import AppNavbar from '@/Components/AppNavbar';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Tiny toast system (no dependency)
// ---------------------------------------------------------------------------
function useToast() {
    const [toasts, setToasts] = useState([]);

    const push = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, msg, type }]);
        setTimeout(
            () => setToasts((prev) => prev.filter((t) => t.id !== id)),
            3000,
        );
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
                    {t.type === 'error' ? (
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                    {t.msg}
                </div>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Product image placeholder
// ---------------------------------------------------------------------------
function ProductImagePlaceholder() {
    return (
        <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
            <svg
                className="h-14 w-14 text-emerald-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.25"
                aria-hidden
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
            </svg>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Per-product "Add to Cart" button — each has its OWN useForm instance
// ---------------------------------------------------------------------------
function AddToCartButton({ product, onSuccess, onError }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: product.id,
        quantity: 1,
    });

    const [qty, setQty] = useState(1);

    function handleAdd(e) {
        e.preventDefault();
        post('/cart/add', {
            preserveScroll: true,
            onSuccess: () => {
                onSuccess(`"${product.name}" added to cart!`);
            },
            onError: (errs) => {
                const msg =
                    errs?.quantity ||
                    errs?.product_id ||
                    'Could not add item.';
                onError(msg);
            },
        });
    }

    function handleQtyChange(val) {
        const next = Math.max(1, Math.min(val, product.stock));
        setQty(next);
        setData('quantity', next);
    }

    const outOfStock = product.stock === 0;

    return (
        <div className="mt-auto space-y-2">
            {/* Quantity selector */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
                <button
                    type="button"
                    onClick={() => handleQtyChange(qty - 1)}
                    disabled={qty <= 1 || outOfStock || processing}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition hover:bg-slate-200 disabled:opacity-40"
                    aria-label="Decrease quantity"
                >
                    −
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-semibold text-slate-700">
                    {qty}
                </span>
                <button
                    type="button"
                    onClick={() => handleQtyChange(qty + 1)}
                    disabled={qty >= product.stock || outOfStock || processing}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition hover:bg-slate-200 disabled:opacity-40"
                    aria-label="Increase quantity"
                >
                    +
                </button>
            </div>

            <button
                type="button"
                onClick={handleAdd}
                disabled={processing || outOfStock}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white transition ${
                    outOfStock
                        ? 'cursor-not-allowed bg-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-70'
                }`}
            >
                {processing ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Adding…
                    </span>
                ) : outOfStock ? (
                    'Out of Stock'
                ) : (
                    'Add to Cart'
                )}
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Store page
// ---------------------------------------------------------------------------
export default function Index({ categories = [], products = [], featuredDoctors = [] }) {
    const { auth, flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const searchWrapRef = useRef(null);
    const debounceRef = useRef(null);
    const { toasts, push: pushToast } = useToast();

    // Show flash messages from backend redirects
    useEffect(() => {
        if (flash?.success) pushToast(flash.success, 'success');
        if (flash?.error)   pushToast(flash.error,   'error');
    }, [flash]);

    // Close search dropdown on outside click
    useEffect(() => {
        function onDocClick(e) {
            if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        }
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    // Debounced search
    const runSearch = useCallback(async (q) => {
        const trimmed = q.trim();
        if (!trimmed) { setSearchResults([]); setSearchLoading(false); return; }
        setSearchLoading(true);
        try {
            const { data } = await axios.get('/api/search', { params: { q: trimmed } });
            setSearchResults(data.products ?? []);
        } catch {
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!searchQuery.trim()) { setSearchResults([]); setSearchLoading(false); return; }
        debounceRef.current = setTimeout(() => runSearch(searchQuery), 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchQuery, runSearch]);

    const filteredProducts =
        selectedCategoryId == null
            ? products
            : products.filter((p) => p.category_id === selectedCategoryId);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Head title="Store — NIDHAAN" />

            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in { animation: slide-in 0.2s ease-out; }
            `}</style>

            <Toasts toasts={toasts} />

            {/* ── Top navigation ─────────────────────────────────────────── */}
            <AppNavbar
                actions={
                    <div ref={searchWrapRef} className="relative">
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                                onFocus={() => setSearchOpen(true)}
                                placeholder="Search medicines…"
                                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                autoComplete="off"
                            />
                            {searchLoading && (
                                <span className="absolute inset-y-0 right-3 flex items-center">
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                                </span>
                            )}
                        </div>

                        {searchOpen && searchQuery.trim() !== '' && (searchResults.length > 0 || !searchLoading) && (
                            <div className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                                {searchResults.length === 0 && !searchLoading ? (
                                    <p className="px-4 py-3 text-sm text-slate-500">No matches found.</p>
                                ) : (
                                    searchResults.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5 last:border-0 hover:bg-slate-50">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                                                <p className="truncate text-xs text-slate-500">
                                                    {p.brand || p.category?.name || '—'} · ₹{Number(p.price).toFixed(2)}
                                                </p>
                                            </div>
                                            <AddToCartButton
                                                product={p}
                                                onSuccess={(msg) => { pushToast(msg, 'success'); setSearchOpen(false); }}
                                                onError={(msg) => pushToast(msg, 'error')}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                }
            />

            <main>
                {/* ── Hero ─────────────────────────────────────────────── */}
                <section className="px-4 pb-6 pt-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-6 py-10 shadow-lg sm:px-10 sm:py-14">
                        <div className="max-w-xl">
                            <p className="text-sm font-medium uppercase tracking-wider text-emerald-100/90">
                                Trusted healthcare
                            </p>
                            <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl">
                                Genuine medicines &amp; care, delivered to your door
                            </h1>
                            <p className="mt-4 text-base text-emerald-50/95">
                                Browse by category, search by name or brand, and
                                build your cart—same quality you expect from a
                                modern pharmacy app.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                                    ✓ Authentic products
                                </span>
                                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                                    ✓ Prescription support
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Doctor Booking Strip ──────────────────────────────── */}
                {featuredDoctors && featuredDoctors.length > 0 && (
                    <section className="px-4 py-10 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
                        <div className="mx-auto max-w-7xl">
                            <div className="flex items-end justify-between mb-7">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">Telemedicine</p>
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                        Consult with Trusted Doctors
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Book a slot with verified specialists — instantly, online.
                                    </p>
                                </div>
                                <Link
                                    href={route('doctors.index')}
                                    id="view-all-doctors-link"
                                    className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:flex"
                                >
                                    View All Doctors
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {featuredDoctors.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                                    >
                                        {/* Avatar + name */}
                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg font-extrabold text-emerald-700">
                                                {doctor.user?.name?.charAt(0) ?? 'D'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-bold text-slate-900">Dr. {doctor.user?.name}</p>
                                                <p className="truncate text-xs font-medium text-emerald-600">{doctor.specialization}</p>
                                            </div>
                                        </div>

                                        {/* Meta */}
                                        <div className="mb-4 flex flex-wrap gap-2 text-xs">
                                            {doctor.experience_years && (
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                                                    {doctor.experience_years} yrs exp
                                                </span>
                                            )}
                                            {doctor.consultation_fee && (
                                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                                                    ₹{Number(doctor.consultation_fee).toFixed(0)} consult
                                                </span>
                                            )}
                                        </div>

                                        {/* CTA */}
                                        <Link
                                            href={route('doctors.show', doctor.id)}
                                            id={`book-doctor-${doctor.id}`}
                                            className="mt-auto block w-full rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-bold text-white transition group-hover:bg-emerald-700"
                                        >
                                            Book Appointment
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Mobile "View All" CTA */}
                            <div className="mt-5 text-center sm:hidden">
                                <Link
                                    href={route('doctors.index')}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
                                >
                                    View All Doctors
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Categories ───────────────────────────────────────── */}
                <section className="border-b border-slate-200/80 bg-white px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Shop by category</h2>
                            {selectedCategoryId != null && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategoryId(null)}
                                    className="text-sm font-medium text-emerald-700 hover:underline"
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>
                        <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
                            {categories.length === 0 ? (
                                <p className="text-sm text-slate-500">Categories appear here once added in admin.</p>
                            ) : (
                                categories.map((c) => {
                                    const active = selectedCategoryId === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setSelectedCategoryId(active ? null : c.id)}
                                            className={`flex min-w-[7.5rem] shrink-0 flex-col items-center rounded-2xl border px-3 py-3 text-center transition sm:min-w-[8.5rem] ${
                                                active
                                                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30'
                                                    : 'border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-white'
                                            }`}
                                        >
                                            <div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                                                {c.image_url ? (
                                                    <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-lg font-bold text-emerald-600">
                                                        {c.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="line-clamp-2 text-xs font-medium text-slate-800">{c.name}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Products grid ────────────────────────────────────── */}
                <section className="px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="mb-6 text-lg font-semibold text-slate-900">
                            All products
                            {selectedCategoryId != null && (
                                <span className="ml-2 font-normal text-slate-500">
                                    ({categories.find((c) => c.id === selectedCategoryId)?.name})
                                </span>
                            )}
                        </h2>

                        {filteredProducts.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-500">
                                No products in this view yet.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {filteredProducts.map((p) => (
                                    <article
                                        key={p.id}
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                                    >
                                        <ProductImagePlaceholder />
                                        <div className="flex flex-1 flex-col p-3 sm:p-4">
                                            <div className="mb-2 flex flex-wrap gap-1">
                                                {p.requires_prescription && (
                                                    <span className="inline-block rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                                        Rx Required
                                                    </span>
                                                )}
                                                {p.stock === 0 && (
                                                    <span className="inline-block rounded bg-slate-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">
                                                {p.name}
                                            </h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {p.category?.name ?? 'Uncategorized'}
                                                {p.brand ? ` · ${p.brand}` : ''}
                                            </p>
                                            <p className="mt-2 text-lg font-bold text-emerald-700">
                                                ₹{Number(p.price).toFixed(2)}
                                            </p>

                                            {/* Server-connected Add to Cart */}
                                            {auth?.user ? (
                                                <AddToCartButton
                                                    product={p}
                                                    onSuccess={(msg) => pushToast(msg, 'success')}
                                                    onError={(msg) => pushToast(msg, 'error')}
                                                />
                                            ) : (
                                                <Link
                                                    href={route('login')}
                                                    className="mt-auto block w-full rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                                                >
                                                    Login to buy
                                                </Link>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
                <p className="font-medium text-slate-700">NIDHAAN</p>
                <p className="mt-1">Pharmacy · Lab tests · Telemedicine</p>
            </footer>
        </div>
    );
}
