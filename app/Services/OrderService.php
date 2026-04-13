<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class OrderService
{
    // -------------------------------------------------------------------------
    //  Public API
    // -------------------------------------------------------------------------

    /**
     * Convert the user's cart into a confirmed Order inside a DB transaction.
     *
     * @param  User               $user
     * @param  string             $shippingAddress
     * @param  UploadedFile|null  $prescriptionFile
     * @return Order
     *
     * @throws ValidationException
     * @throws \RuntimeException
     */
    public function createOrder(
        User $user,
        string $shippingAddress,
        ?UploadedFile $prescriptionFile = null,
    ): Order {
        // ── 1. Load cart ──────────────────────────────────────────────────────
        $cart = $user->cart?->load('items.product');

        if (!$cart || $cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => 'Your cart is empty. Please add items before placing an order.',
            ]);
        }

        // ── 2. Pre-flight validation ──────────────────────────────────────────
        $this->validateCartItems($cart, $prescriptionFile);

        // ── 3. Handle prescription upload ─────────────────────────────────────
        $prescriptionUrl = null;
        if ($prescriptionFile) {
            $prescriptionUrl = $this->storePrescription($prescriptionFile);
        }

        // ── 4. Wrap everything in a transaction ───────────────────────────────
        return DB::transaction(function () use ($user, $cart, $shippingAddress, $prescriptionUrl): Order {

            // 4a. Calculate total from snapshot prices in cart_items
            $totalAmount = $cart->items->sum(
                fn ($item) => (float) $item->price * $item->quantity,
            );

            // 4b. Create the order record
            $order = Order::create([
                'user_id'          => $user->id,
                'total_amount'     => $totalAmount,
                'status'           => 'pending',
                'shipping_address' => $shippingAddress,
                'prescription_url' => $prescriptionUrl,
            ]);

            // 4c. Create order items + decrement stock
            foreach ($cart->items as $cartItem) {
                /** @var \App\Models\CartItem $cartItem */

                // Re-fetch product inside the transaction for a fresh lock
                $product = Product::lockForUpdate()->findOrFail($cartItem->product_id);

                // Final stock guard (race-condition protection)
                if ($product->stock < $cartItem->quantity) {
                    throw ValidationException::withMessages([
                        'stock' => "\"{$product->name}\" no longer has sufficient stock. Please update your cart.",
                    ]);
                }

                $order->orderItems()->create([
                    'product_id' => $product->id,
                    'quantity'   => $cartItem->quantity,
                    'price'      => $cartItem->price, // use snapshot price, not current price
                ]);

                // Decrement stock
                $product->decrement('stock', $cartItem->quantity);
            }

            // 4d. Clear cart items (keep the cart record itself)
            $cart->items()->delete();

            return $order->load('orderItems.product');
        });
    }

    // -------------------------------------------------------------------------
    //  Private helpers
    // -------------------------------------------------------------------------

    /**
     * Transition an order to a new status.
     *
     * Two guards run in sequence:
     *  1. Transition validity — is pending→shipped ever allowed? No.
     *  2. Role authorisation  — is this user allowed to trigger this specific transition?
     *
     * @throws ValidationException
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException  (403)
     */
    public function updateStatus(Order $order, OrderStatus $newStatus, User $actor): Order
    {
        $currentStatus = $order->status; // already an OrderStatus instance (via cast)

        // ── 1. Validate the transition is part of the allowed graph ───────────
        if (! $currentStatus->canTransitionTo($newStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Cannot transition an order from "%s" to "%s". Allowed next status: "%s".',
                    $currentStatus->label(),
                    $newStatus->label(),
                    $currentStatus->next()?->label() ?? 'none (terminal state)',
                ),
            ]);
        }

        // ── 2. Validate the actor has a role permitted for this transition ─────
        $allowedRoles = $currentStatus->allowedRoles();

        if (empty($allowedRoles) || ! $actor->hasAnyRole($allowedRoles)) {
            abort(403, sprintf(
                'You do not have permission to move an order from "%s" to "%s".',
                $currentStatus->label(),
                $newStatus->label(),
            ));
        }

        // ── 3. Persist ────────────────────────────────────────────────────────
        $order->status = $newStatus;
        $order->save();

        return $order->refresh();
    }

    /**
     * Validate every cart item before touching the DB.
     *
     * Checks:
     *  - Product still exists and is not soft-deleted
     *  - Sufficient stock
     *  - Prescription required → file must be present
     *
     * @throws ValidationException
     */
    private function validateCartItems(Cart $cart, ?UploadedFile $prescriptionFile): void
    {
        $errors = [];

        foreach ($cart->items as $item) {
            $product = $item->product;

            // Product must still exist (not soft-deleted)
            if (!$product) {
                $errors['cart'][] = "A product in your cart (ID {$item->product_id}) is no longer available.";
                continue;
            }

            // Stock check
            if ($product->stock < $item->quantity) {
                $errors['stock'][] = "Only {$product->stock} unit(s) of \"{$product->name}\" available (you need {$item->quantity}).";
            }

            // Prescription check
            if ($product->requires_prescription && !$prescriptionFile) {
                $errors['prescription'][] = "\"{$product->name}\" requires a valid prescription. Please upload one.";
            }
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }

    /**
     * Store the prescription file and return its public path.
     *
     * Files are stored at: storage/app/public/prescriptions/
     * Accessible via:      /storage/prescriptions/...   (after storage:link)
     */
    private function storePrescription(UploadedFile $file): string
    {
        $path = $file->store('prescriptions', 'public');

        return Storage::url($path); // e.g. /storage/prescriptions/abc.pdf
    }
}
