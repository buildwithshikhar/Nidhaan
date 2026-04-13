<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\DoctorProfile;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'image_url']);

        $products = Product::query()
            ->with(['category:id,name,slug'])
            ->orderBy('name')
            ->get([
                'id',
                'category_id',
                'name',
                'slug',
                'description',
                'price',
                'stock',
                'requires_prescription',
                'brand',
                'salts',
            ]);

        $featuredDoctors = DoctorProfile::with('user')
            ->limit(4)
            ->get();

        return Inertia::render('Store/Index', [
            'categories'      => $categories,
            'products'        => $products,
            'featuredDoctors' => $featuredDoctors,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));

        if ($query === '') {
            return response()->json(['products' => []]);
        }

        $products = Product::query()
            ->with(['category:id,name,slug'])
            ->where(function ($q) use ($query): void {
                $q->where('name', 'like', '%'.$query.'%')
                    ->orWhere('brand', 'like', '%'.$query.'%');
            })
            ->orderBy('name')
            ->limit(24)
            ->get([
                'id',
                'category_id',
                'name',
                'slug',
                'description',
                'price',
                'stock',
                'requires_prescription',
                'brand',
                'salts',
            ]);

        return response()->json(['products' => $products]);
    }
}
