<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoreController;

// 👨‍⚕️ Doctor Controllers
use App\Http\Controllers\Doctor\DashboardController;
use App\Http\Controllers\Doctor\DoctorAppointmentController;
use App\Http\Controllers\Doctor\DoctorAvailabilityController;
use App\Http\Controllers\Doctor\PublicDoctorController;
use App\Http\Controllers\AppointmentController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [StoreController::class, 'index'])->name('home');

Route::get('/api/search', [StoreController::class, 'search']);

// ── Doctors (Public) ─────────────────────────────────────────────────────
Route::get('/doctors', [PublicDoctorController::class, 'index'])->name('doctors.index');
Route::get('/doctors/{id}', [PublicDoctorController::class, 'show'])->name('doctors.show');

/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    // ── Dashboard ────────────────────────────────────────────────────────────
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // ── Profile ──────────────────────────────────────────────────────────────
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ── Cart ─────────────────────────────────────────────────────────────────
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/',               [CartController::class, 'index'])->name('index');
        Route::post('/add',           [CartController::class, 'add'])->name('add');
        Route::put('/update',         [CartController::class, 'update'])->name('update');
        Route::delete('/remove/{id}', [CartController::class, 'remove'])->name('remove');
    });

    // ── Checkout ─────────────────────────────────────────────────────────────
    Route::get('/checkout',  [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    // ── Orders ───────────────────────────────────────────────────────────────
    Route::get('/orders',                [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}',           [OrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.updateStatus');

    // ── Appointments Booking ─────────────────────────────────────────────────
    Route::post('/appointments/book', [AppointmentController::class, 'book'])->name('appointments.book');
});

/*
|--------------------------------------------------------------------------
| Doctor Panel Routes (Protected by Role)
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Doctor Panel Routes (Protected by Role)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:Doctor'])
    ->prefix('doctor')
    ->name('doctor.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Doctor\DashboardController::class, 'index'])
            ->name('dashboard');

        // Appointments
        Route::get('/appointments', [\App\Http\Controllers\Doctor\DoctorAppointmentController::class, 'index'])
            ->name('appointments');

        Route::put('/appointments/{appointment}/status', [DoctorAppointmentController::class, 'updateStatus'])
            ->name('appointments.updateStatus');

        // Availability
        Route::get('/availability', [DoctorAvailabilityController::class, 'index'])
            ->name('availability.index');
        Route::post('/availability', [DoctorAvailabilityController::class, 'store'])
            ->name('availability.store');
    });

/*
|--------------------------------------------------------------------------
| Auth Routes (Breeze)
|--------------------------------------------------------------------------
*/

require __DIR__.'/auth.php';