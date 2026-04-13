<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Services\CartService;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService  $cartService,
        private readonly OrderService $orderService,
    ) {}

    // -------------------------------------------------------------------------
    //  GET /checkout
    // -------------------------------------------------------------------------

    /**
     * Render the checkout page with the user's current cart as props.
     */
    public function index(Request $request): Response
    {
        $cart = $this->cartService->getCart($request->user());

        // Format cart identical to CartController so the frontend shape is consistent
        $items = $cart->items->map(fn ($item) => [
            'id'         => $item->id,
            'product_id' => $item->product_id,
            'product'    => [
                'id'                    => $item->product?->id,
                'name'                  => $item->product?->name,
                'brand'                 => $item->product?->brand,
                'requires_prescription' => $item->product?->requires_prescription ?? false,
            ],
            'quantity'   => $item->quantity,
            'price'      => (float) $item->price,
            'line_total' => (float) ($item->price * $item->quantity),
        ]);

        $requiresPrescription = $items->contains(
            fn ($i) => $i['product']['requires_prescription'],
        );

        return Inertia::render('Checkout/Index', [
            'cart' => [
                'cart_id'                => $cart->id,
                'items'                  => $items,
                'total_items'            => $items->sum('quantity'),
                'total_price'            => $items->sum('line_total'),
                'requires_prescription'  => $requiresPrescription,
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    //  POST /checkout
    // -------------------------------------------------------------------------

    /**
     * Process the checkout: validate, create order, redirect.
     */
    public function store(CheckoutRequest $request): RedirectResponse
    {
        try {
            $order = $this->orderService->createOrder(
                user:             $request->user(),
                shippingAddress:  $request->validated('shipping_address'),
                prescriptionFile: $request->file('prescription'),
            );

            return redirect()
                ->route('orders.show', $order->id)
                ->with('success', "Order #{$order->id} placed successfully! We'll process it shortly.");

        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Throwable $e) {
            report($e); // log to Laravel's error handler

            return back()
                ->withErrors(['order' => 'Something went wrong while placing your order. Please try again.'])
                ->withInput();
        }
    }
}
