<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService)
    {
    }

    // -------------------------------------------------------------------------
    //  GET /cart
    // -------------------------------------------------------------------------

    /**
     * Render the Cart page via Inertia, passing formatted cart data as props.
     */
    public function index(Request $request): Response
    {
        $cart = $this->cartService->getCart($request->user());

        return Inertia::render('Cart/Index', [
            'cart' => $this->formatCart($cart),
        ]);
    }

    // -------------------------------------------------------------------------
    //  POST /cart/add
    // -------------------------------------------------------------------------

    /**
     * Add a product to the cart.
     * Redirects back so Inertia re-renders the originating page.
     */
    public function add(AddToCartRequest $request): RedirectResponse
    {
        try {
            $this->cartService->addToCart(
                $request->user(),
                (int) $request->validated('product_id'),
                (int) $request->validated('quantity'),
            );

            return back()->with('success', 'Item added to cart.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }
    }

    // -------------------------------------------------------------------------
    //  PUT /cart/update
    // -------------------------------------------------------------------------

    /**
     * Update the quantity of an existing cart item.
     */
    public function update(UpdateCartItemRequest $request): RedirectResponse
    {
        try {
            $this->cartService->updateQuantity(
                $request->user(),
                (int) $request->validated('cart_item_id'),
                (int) $request->validated('quantity'),
            );

            return back()->with('success', 'Cart updated.');
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }
    }

    // -------------------------------------------------------------------------
    //  DELETE /cart/remove/{id}
    // -------------------------------------------------------------------------

    /**
     * Remove a single item from the cart.
     */
    public function remove(Request $request, int $id): RedirectResponse
    {
        $this->cartService->removeItem($request->user(), $id);

        return back()->with('success', 'Item removed.');
    }

    // -------------------------------------------------------------------------
    //  Helpers
    // -------------------------------------------------------------------------

    /**
     * Normalise a Cart model into a consistent API response shape.
     *
     * @param  \App\Models\Cart  $cart
     * @return array<string, mixed>
     */
    private function formatCart(\App\Models\Cart $cart): array
    {
        $items = $cart->items->map(fn (\App\Models\CartItem $item) => [
            'id'         => $item->id,
            'product_id' => $item->product_id,
            'product'    => [
                'id'    => $item->product?->id,
                'name'  => $item->product?->name,
                'slug'  => $item->product?->slug,
                'brand' => $item->product?->brand,
                'image' => null, // extend when media library is added
            ],
            'quantity'   => $item->quantity,
            'price'      => (float) $item->price, // snapshot price
            'line_total' => (float) ($item->price * $item->quantity),
        ]);

        return [
            'cart_id'     => $cart->id,
            'items'       => $items,
            'total_items' => $items->sum('quantity'),
            'total_price' => $items->sum('line_total'),
        ];
    }
}
