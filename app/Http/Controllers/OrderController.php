<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    // -------------------------------------------------------------------------
    //  GET /orders
    // -------------------------------------------------------------------------

    /**
     * List all orders that belong to the authenticated user,
     * newest first, with item + product details.
     */
    public function index(Request $request): Response
    {
        $orders = Order::with(['orderItems.product'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order));

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
        ]);
    }

    // -------------------------------------------------------------------------
    //  GET /orders/{id}
    // -------------------------------------------------------------------------

    /**
     * Display a single order.
     * Users may only view their own orders;
     * admins can see any order via the Filament panel.
     */
    public function show(Request $request, int $id): Response
    {
        $order = Order::with(['orderItems.product'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return Inertia::render('Orders/Show', [
            'order' => $this->formatOrder($order),
        ]);
    }

    // -------------------------------------------------------------------------
    //  PUT /orders/{order}/status
    // -------------------------------------------------------------------------

    /**
     * Transition an order to the next status.
     *
     * The actor must:
     *  (a) supply a valid next status value, AND
     *  (b) hold a role that is permitted for this specific transition.
     *
     * Both of these checks live in OrderService → OrderStatus (the enum).
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        // Validate the incoming status string is a known enum value
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', array_column(OrderStatus::cases(), 'value'))],
        ]);

        $newStatus = OrderStatus::from($validated['status']);

        try {
            $this->orderService->updateStatus($order, $newStatus, $request->user());

            return back()->with('success', "Order #{$order->id} moved to {$newStatus->label()}.");

        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }
        // 403 aborts are handled by Laravel's exception handler automatically
    }

    // -------------------------------------------------------------------------
    //  Helpers
    // -------------------------------------------------------------------------

    /**
     * Normalise an Order model into a consistent frontend-ready shape.
     *
     * @return array<string, mixed>
     */
    private function formatOrder(Order $order): array
    {
        $items = $order->orderItems->map(fn ($item) => [
            'id'         => $item->id,
            'product_id' => $item->product_id,
            'product'    => [
                'id'    => $item->product?->id,
                'name'  => $item->product?->name,
                'brand' => $item->product?->brand,
            ],
            'quantity'   => $item->quantity,
            'price'      => (float) $item->price,
            'line_total' => (float) ($item->price * $item->quantity),
        ]);

        return [
            'id'               => $order->id,
            'status'           => $order->status->value,   // raw string for JS
            'status_label'     => $order->status->label(), // human-readable
            'status_colour'    => $order->status->colour(), // Tailwind colour token
            'total_amount'     => (float) $order->total_amount,
            'shipping_address' => $order->shipping_address,
            'prescription_url' => $order->prescription_url,
            'created_at'       => $order->created_at->toDateTimeString(),
            'items'            => $items,
            'items_count'      => $items->count(),
        ];
    }
}
