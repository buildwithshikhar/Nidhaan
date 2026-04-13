<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class CartService
{
    // -------------------------------------------------------------------------
    //  Public API
    // -------------------------------------------------------------------------

    /**
     * Retrieve (or create) the authenticated user's cart with all items
     * and their associated products.
     */
    public function getCart(User $user): Cart
    {
        $cart = $user->cart ?? $this->createCart($user);

        return $cart->load('items.product');
    }

    /**
     * Add a product to the user's cart.
     *
     * - Validates stock availability.
     * - If the product already exists in the cart, the quantities are merged.
     * - Price is always snapshotted from the database (never trusted from the client).
     *
     * @throws ValidationException
     */
    public function addToCart(User $user, int $productId, int $quantity): Cart
    {
        $product = $this->findProductOrFail($productId);

        $cart = $user->cart ?? $this->createCart($user);

        $existingItem = $cart->items()->where('product_id', $productId)->first();

        $newQuantity = $existingItem
            ? $existingItem->quantity + $quantity
            : $quantity;

        $this->validateStock($product, $newQuantity);

        if ($existingItem) {
            $existingItem->update(['quantity' => $newQuantity]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity'   => $quantity,
                'price'      => $product->price, // snapshot — never from frontend
            ]);
        }

        return $cart->load('items.product');
    }

    /**
     * Update the quantity of a specific cart item.
     *
     * @throws ValidationException
     */
    public function updateQuantity(User $user, int $cartItemId, int $quantity): Cart
    {
        $cart = $this->getCart($user);

        /** @var CartItem $item */
        $item = $cart->items()->where('id', $cartItemId)->firstOrFail();

        // Always fetch fresh product to check current stock
        $product = $this->findProductOrFail($item->product_id);
        $this->validateStock($product, $quantity);

        $item->update(['quantity' => $quantity]);

        return $cart->load('items.product');
    }

    /**
     * Remove a single item from the user's cart.
     */
    public function removeItem(User $user, int $cartItemId): Cart
    {
        $cart = $this->getCart($user);

        $cart->items()->where('id', $cartItemId)->delete();

        return $cart->load('items.product');
    }

    // -------------------------------------------------------------------------
    //  Private helpers
    // -------------------------------------------------------------------------

    /**
     * Create a fresh empty cart for the given user.
     */
    private function createCart(User $user): Cart
    {
        return Cart::create(['user_id' => $user->id]);
    }

    /**
     * Resolve a product by ID; throw a 404-equivalent if not found or soft-deleted.
     *
     * @throws ModelNotFoundException
     */
    private function findProductOrFail(int $productId): Product
    {
        return Product::findOrFail($productId);
    }

    /**
     * Ensure the requested quantity does not exceed available stock.
     *
     * @throws ValidationException
     */
    private function validateStock(Product $product, int $quantity): void
    {
        if ($quantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => "Only {$product->stock} unit(s) of \"{$product->name}\" are available in stock.",
            ]);
        }
    }
}
