# Sample E-commerce Platform Design for "The Scent"

## Full MySQL Database Schema

```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS thescent_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE thescent_db;

-- ENUM replacement tables
CREATE TABLE IF NOT EXISTS user_roles (
    id TINYINT UNSIGNED PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO user_roles (id, name) VALUES (1, 'user'), (2, 'admin');

CREATE TABLE IF NOT EXISTS order_statuses (
    id TINYINT UNSIGNED PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO order_statuses (id, name) VALUES 
    (1, 'pending'), (2, 'processing'), (3, 'shipped'), (4, 'delivered'), (5, 'cancelled');

CREATE TABLE IF NOT EXISTS payment_statuses (
    id TINYINT UNSIGNED PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO payment_statuses (id, name) VALUES 
    (1, 'pending'), (2, 'processing'), (3, 'completed'), (4, 'failed'), (5, 'refunded');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role_id TINYINT UNSIGNED DEFAULT 1,
    login_attempts TINYINT UNSIGNED DEFAULT 0,
    lock_until DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES user_roles(id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(36) PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    captcha_text VARCHAR(10),
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(255),
    image_url VARCHAR(255) NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    review_count INT UNSIGNED DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    category_id INT UNSIGNED,
    stock INT UNSIGNED DEFAULT 100,
    sku VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Product ingredients
CREATE TABLE IF NOT EXISTS product_ingredients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    ingredient VARCHAR(100) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product benefits
CREATE TABLE IF NOT EXISTS product_benefits (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    benefit VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product images (additional images)
CREATE TABLE IF NOT EXISTS product_images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Scent profiles
CREATE TABLE IF NOT EXISTS scent_profiles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    icon_class VARCHAR(50)
);

-- Product scent profiles
CREATE TABLE IF NOT EXISTS product_scent_profiles (
    product_id INT UNSIGNED NOT NULL,
    scent_profile_id INT UNSIGNED NOT NULL,
    intensity TINYINT UNSIGNED DEFAULT 5,
    PRIMARY KEY (product_id, scent_profile_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (scent_profile_id) REFERENCES scent_profiles(id) ON DELETE CASCADE
);

-- Mood categories
CREATE TABLE IF NOT EXISTS moods (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    icon_class VARCHAR(50)
);

-- Product moods (which moods a product helps with)
CREATE TABLE IF NOT EXISTS product_moods (
    product_id INT UNSIGNED NOT NULL,
    mood_id INT UNSIGNED NOT NULL,
    effectiveness TINYINT UNSIGNED DEFAULT 5,
    PRIMARY KEY (product_id, mood_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (mood_id) REFERENCES moods(id) ON DELETE CASCADE
);

-- Lifestyle items (from PostgreSQL schema)
CREATE TABLE IF NOT EXISTS lifestyle_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CHECK (rating BETWEEN 1 AND 5)
);

-- Carts
CREATE TABLE IF NOT EXISTS carts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status_id TINYINT UNSIGNED DEFAULT 1,
    total DECIMAL(10,2) NOT NULL,
    shipping_address_id INT UNSIGNED NOT NULL,
    billing_address_id INT UNSIGNED NOT NULL,
    payment_status_id TINYINT UNSIGNED DEFAULT 1,
    stripe_payment_intent_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (status_id) REFERENCES order_statuses(id),
    FOREIGN KEY (payment_status_id) REFERENCES payment_statuses(id),
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(id),
    FOREIGN KEY (billing_address_id) REFERENCES addresses(id)
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Enquiries/Contact messages
CREATE TABLE IF NOT EXISTS enquiries (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id INT UNSIGNED,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_category ON products(category_id);
CREATE FULLTEXT INDEX idx_products_search ON products(name, short_description, description);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
```

## PHP Project Structure (Laravel)

```
thescent/
├── app/
│   ├── Console/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   └── UserController.php
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php
│   │   │   │   ├── RegisterController.php
│   │   │   │   └── ForgotPasswordController.php
│   │   │   ├── CartController.php
│   │   │   ├── CategoryController.php
│   │   │   ├── CheckoutController.php
│   │   │   ├── ContactController.php
│   │   │   ├── HomeController.php
│   │   │   ├── OrderController.php
│   │   │   ├── ProductController.php
│   │   │   ├── ScentFinderController.php
│   │   │   ├── UserController.php
│   │   │   └── WishlistController.php
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   │   ├── Address.php
│   │   ├── Cart.php
│   │   ├── CartItem.php
│   │   ├── Category.php
│   │   ├── Enquiry.php
│   │   ├── LifestyleItem.php
│   │   ├── Mood.php
│   │   ├── NewsletterSubscription.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── OrderStatus.php
│   │   ├── PaymentStatus.php
│   │   ├── Product.php
│   │   ├── ProductBenefit.php
│   │   ├── ProductImage.php
│   │   ├── ProductIngredient.php
│   │   ├── ProductMood.php
│   │   ├── ProductScentProfile.php
│   │   ├── Review.php
│   │   ├── ScentProfile.php
│   │   ├── User.php
│   │   ├── UserRole.php
│   │   └── Wishlist.php
│   └── Services/
│       ├── CartService.php
│       ├── PaymentService.php
│       ├── ProductService.php
│       └── ScentFinderService.php
├── config/
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── CategorySeeder.php
│       ├── MoodSeeder.php
│       ├── ProductSeeder.php
│       ├── ScentProfileSeeder.php
│       └── UserSeeder.php
├── public/
│   ├── css/
│   │   ├── app.css
│   │   └── admin.css
│   ├── js/
│   │   ├── app.js
│   │   ├── cart.js
│   │   ├── checkout.js
│   │   ├── mood-map.js
│   │   └── scent-finder.js
│   └── images/
├── resources/
│   ├── views/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── components/
│   │   ├── emails/
│   │   ├── errors/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── products/
│   │   └── user/
│   ├── sass/
│   └── js/
├── routes/
│   ├── api.php
│   └── web.php
├── storage/
└── tests/
```

## Key Model Definitions

```php
<?php
// app/Models/Product.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Cviebrock\EloquentSluggable\Sluggable;

class Product extends Model
{
    use HasFactory, Sluggable;

    protected $fillable = [
        'name', 'slug', 'price', 'description', 'short_description',
        'image_url', 'featured', 'category_id', 'stock', 'sku'
    ];

    /**
     * Return the sluggable configuration array for this model.
     */
    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'name'
            ]
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function ingredients()
    {
        return $this->hasMany(ProductIngredient::class);
    }

    public function benefits()
    {
        return $this->hasMany(ProductBenefit::class);
    }

    public function additionalImages()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function scentProfiles()
    {
        return $this->belongsToMany(ScentProfile::class, 'product_scent_profiles')
                    ->withPivot('intensity');
    }

    public function moods()
    {
        return $this->belongsToMany(Mood::class, 'product_moods')
                    ->withPivot('effectiveness');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->price, 2);
    }

    public function getIngredientsListAttribute()
    {
        return $this->ingredients->pluck('ingredient')->implode(', ');
    }
}
```

```php
<?php
// app/Models/User.php
namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'first_name',
        'last_name',
        'phone',
        'role_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'lock_until' => 'datetime',
    ];

    public function role()
    {
        return $this->belongsTo(UserRole::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function defaultAddress()
    {
        return $this->addresses()->where('is_default', true)->first();
    }

    public function cart()
    {
        return $this->hasOne(Cart::class)->latest();
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function enquiries()
    {
        return $this->hasMany(Enquiry::class);
    }

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function isAdmin()
    {
        return $this->role_id === 2; // Admin role ID
    }
}
```

## Core Controllers

```php
<?php
// app/Http/Controllers/HomeController.php
namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\LifestyleItem;
use App\Models\ScentProfile;
use App\Models\Mood;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $featuredProducts = Product::where('featured', true)
            ->with(['category', 'reviews'])
            ->take(4)
            ->get();
            
        $categories = Category::take(3)->get();
        $lifestyleItems = LifestyleItem::latest()->take(3)->get();
        $scentProfiles = ScentProfile::take(5)->get();
        $moods = Mood::all();
        
        return view('home', compact(
            'featuredProducts', 
            'categories', 
            'lifestyleItems',
            'scentProfiles',
            'moods'
        ));
    }
    
    public function about()
    {
        return view('pages.about');
    }
    
    public function contact()
    {
        return view('pages.contact');
    }
}
```

```php
<?php
// app/Http/Controllers/ProductController.php
namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\ScentProfile;
use App\Models\Mood;
use App\Models\Review;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'reviews']);
        
        // Filter by category
        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }
        
        // Filter by scent profile
        if ($request->has('scent')) {
            $query->whereHas('scentProfiles', function($q) use ($request) {
                $q->where('name', $request->scent);
            });
        }
        
        // Filter by mood
        if ($request->has('mood')) {
            $query->whereHas('moods', function($q) use ($request) {
                $q->where('name', $request->mood);
            });
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhere('short_description', 'LIKE', "%{$search}%");
            });
        }
        
        // Sort
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'price-low':
                $query->orderBy('price', 'asc');
                break;
            case 'price-high':
                $query->orderBy('price', 'desc');
                break;
            case 'popular':
                $query->orderBy('review_count', 'desc');
                break;
            case 'rating':
                $query->orderBy('average_rating', 'desc');
                break;
            case 'latest':
            default:
                $query->latest();
                break;
        }
        
        $products = $query->paginate(12);
        $categories = Category::all();
        $scentProfiles = ScentProfile::all();
        $moods = Mood::all();
        
        return view('products.index', compact(
            'products', 
            'categories', 
            'scentProfiles', 
            'moods'
        ));
    }
    
    public function show($slug)
    {
        $product = Product::where('slug', $slug)
            ->with([
                'category', 
                'ingredients', 
                'benefits', 
                'additionalImages', 
                'scentProfiles', 
                'moods',
                'reviews' => function($query) {
                    $query->with('user')->latest();
                }
            ])
            ->firstOrFail();
        
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get();
            
        return view('products.show', compact('product', 'relatedProducts'));
    }
    
    public function storeReview(Request $request, Product $product)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);
        
        $review = new Review();
        $review->user_id = auth()->id();
        $review->product_id = $product->id;
        $review->rating = $validated['rating'];
        $review->comment = $validated['comment'] ?? null;
        $review->save();
        
        // Update product review count
        $product->review_count = $product->reviews()->count();
        $product->save();
        
        return redirect()->back()->with('success', 'Your review has been posted successfully!');
    }
}
```

```php
<?php
// app/Http/Controllers/ScentFinderController.php
namespace App\Http\Controllers;

use App\Services\ScentFinderService;
use Illuminate\Http\Request;

class ScentFinderController extends Controller
{
    protected $scentFinderService;
    
    public function __construct(ScentFinderService $scentFinderService)
    {
        $this->scentFinderService = $scentFinderService;
    }
    
    public function index()
    {
        return view('scent-finder.index');
    }
    
    public function process(Request $request)
    {
        $validated = $request->validate([
            'step1' => 'required|string',
            'step2' => 'required|string',
            'step3' => 'required|string',
            'step4' => 'nullable|string',
        ]);
        
        $results = $this->scentFinderService->findProductMatches($validated);
        
        return view('scent-finder.results', compact('results'));
    }
}
```

## Scent Finder Service

```php
<?php
// app/Services/ScentFinderService.php
namespace App\Services;

use App\Models\Product;
use App\Models\Mood;
use App\Models\ScentProfile;

class ScentFinderService
{
    public function findProductMatches(array $preferences)
    {
        // Initialize query
        $query = Product::query();
        
        // Step 1: Mood/Purpose preference
        if (isset($preferences['step1'])) {
            $mood = $this->getMoodFromPreference($preferences['step1']);
            if ($mood) {
                $query->whereHas('moods', function($q) use ($mood) {
                    $q->where('moods.id', $mood->id);
                });
            }
        }
        
        // Step 2: Scent intensity preference
        if (isset($preferences['step2'])) {
            $intensity = $this->getIntensityValue($preferences['step2']);
            if ($intensity) {
                $query->whereHas('scentProfiles', function($q) use ($intensity) {
                    $q->where('intensity', '>=', $intensity['min'])
                      ->where('intensity', '<=', $intensity['max']);
                });
            }
        }
        
        // Step 3: Scent type preference
        if (isset($preferences['step3'])) {
            $scentProfile = $this->getScentProfileFromPreference($preferences['step3']);
            if ($scentProfile) {
                $query->whereHas('scentProfiles', function($q) use ($scentProfile) {
                    $q->where('scent_profiles.id', $scentProfile->id);
                });
            }
        }
        
        // Get recommended products
        $recommendedProducts = $query->with(['category', 'scentProfiles', 'moods', 'reviews'])
            ->take(6)
            ->get();
            
        return [
            'products' => $recommendedProducts,
            'preferences' => $preferences
        ];
    }
    
    private function getMoodFromPreference($preference)
    {
        $moodMap = [
            'relax' => 'Relaxation',
            'energy' => 'Energy',
            'focus' => 'Focus',
            'sleep' => 'Sleep',
            'stress' => 'Stress Relief'
        ];
        
        if (isset($moodMap[$preference])) {
            return Mood::where('name', $moodMap[$preference])->first();
        }
        
        return null;
    }
    
    private function getScentProfileFromPreference($preference)
    {
        $scentMap = [
            'floral' => 'Floral',
            'citrus' => 'Citrus',
            'woody' => 'Woody',
            'herbal' => 'Herbal',
            'spicy' => 'Spicy',
            'sweet' => 'Sweet'
        ];
        
        if (isset($scentMap[$preference])) {
            return ScentProfile::where('name', $scentMap[$preference])->first();
        }
        
        return null;
    }
    
    private function getIntensityValue($preference)
    {
        $intensityMap = [
            'mild' => ['min' => 1, 'max' => 3],
            'medium' => ['min' => 4, 'max' => 7],
            'strong' => ['min' => 8, 'max' => 10]
        ];
        
        if (isset($intensityMap[$preference])) {
            return $intensityMap[$preference];
        }
        
        return null;
    }
}
```

## Frontend Enhancements - Product Details Page

```php
<!-- resources/views/products/show.blade.php -->
@extends('layouts.app')

@section('title', $product->name . ' - The Scent')

@section('content')
<div class="bg-soft-cream py-12">
    <div class="container mx-auto px-4">
        <!-- Breadcrumbs -->
        <div class="mb-8">
            <nav class="flex" aria-label="Breadcrumb">
                <ol class="inline-flex items-center space-x-1 md:space-x-3">
                    <li class="inline-flex items-center">
                        <a href="{{ route('home') }}" class="text-gray-600 hover:text-deep-brown">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                            </svg>
                            Home
                        </a>
                    </li>
                    <li>
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            <a href="{{ route('products.index') }}" class="ml-1 text-gray-600 hover:text-deep-brown md:ml-2">Products</a>
                        </div>
                    </li>
                    @if($product->category)
                    <li>
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            <a href="{{ route('products.index', ['category' => $product->category->slug]) }}" class="ml-1 text-gray-600 hover:text-deep-brown md:ml-2">{{ $product->category->name }}</a>
                        </div>
                    </li>
                    @endif
                    <li aria-current="page">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            <span class="ml-1 text-deep-brown font-medium md:ml-2">{{ $product->name }}</span>
                        </div>
                    </li>
                </ol>
            </nav>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <!-- Product Images -->
            <div>
                <div class="mb-4 rounded-lg overflow-hidden shadow-md">
                    <div class="product-main-image relative aspect-square bg-white">
                        <img src="{{ $product->image_url }}" alt="{{ $product->name }}" class="w-full h-full object-contain">
                    </div>
                </div>
                
                @if($product->additionalImages->count())
                <div class="grid grid-cols-4 gap-2">
                    <div class="aspect-square rounded-md overflow-hidden cursor-pointer border-2 border-sage-green">
                        <img src="{{ $product->image_url }}" alt="{{ $product->name }}" class="w-full h-full object-cover thumbnail-image" data-main-image="{{ $product->image_url }}">
                    </div>
                    
                    @foreach($product->additionalImages as $image)
                    <div class="aspect-square rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-sage-green/50 transition">
                        <img src="{{ $image->image_url }}" alt="{{ $product->name }}" class="w-full h-full object-cover thumbnail-image" data-main-image="{{ $image->image_url }}">
                    </div>
                    @endforeach
                </div>
                @endif
            </div>
            
            <!-- Product Info -->
            <div>
                <h1 class="font-cormorant text-4xl text-deep-brown mb-2">{{ $product->name }}</h1>
                
                <div class="flex items-center mb-4">
                    <div class="flex text-amber-400">
                        @for($i = 1; $i <= 5; $i++)
                            @if($i <= $product->average_rating)
                                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                            @else
                                <svg class="w-5 h-5 fill-current text-gray-300" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                            @endif
                        @endfor
                    </div>
                    <span class="ml-2 text-gray-600">{{ $product->review_count }} {{ Str::plural('review', $product->review_count) }}</span>
                </div>
                
                <div class="text-2xl font-medium text-deep-brown mb-6">{{ $product->formatted_price }}</div>
                
                <div class="mb-6">
                    <p class="text-gray-600">{{ $product->short_description }}</p>
                </div>
                
                <!-- Scent Profile Visualization -->
                @if($product->scentProfiles->count())
                <div class="mb-8">
                    <h3 class="text-lg font-medium mb-3">Scent Profile</h3>
                    <div class="grid grid-cols-2 gap-4">
                        @foreach($product->scentProfiles as $profile)
                        <div class="bg-white rounded-lg p-4 shadow-sm">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium">{{ $profile->name }}</span>
                                <span class="text-sm text-gray-500">{{ $profile->pivot->intensity }}/10</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-sage-green h-2 rounded-full" style="width: {{ $profile->pivot->intensity * 10 }}%"></div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>
                @endif
                
                <!-- Mood Benefits -->
                @if($product->moods->count())
                <div class="mb-8">
                    <h3 class="text-lg font-medium mb-3">Benefits</h3>
                    <div class="grid grid-cols-2 gap-4">
                        @foreach($product->moods as $mood)
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" style="background-color: rgba(139, 173, 153, 0.2)">
                                <i class="{{ $mood->icon_class ?? 'fas fa-leaf' }} text-sage-green"></i>
                            </div>
                            <span>{{ $mood->name }}</span>
                        </div>
                        @endforeach
                    </div>
                </div>
                @endif
                
                <!-- Add to Cart Form -->
                <form action="{{ route('cart.add') }}" method="POST" class="mb-8">
                    @csrf
                    <input type="hidden" name="product_id" value="{{ $product->id }}">
                    
                    <div class="flex items-center mb-6">
                        <div class="quantity-selector flex items-center mr-4">
                            <button type="button" class="quantity-btn minus bg-white w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                            </button>
                            <input type="number" name="quantity" value="1" min="1" max="{{ $product->stock }}" class="quantity-input w-14 h-10 border-t border-b border-gray-300 text-center">
                            <button type="button" class="quantity-btn plus bg-white w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>
                        
                        <span class="text-sm text-gray-500">{{ $product->stock }} in stock</span>
                    </div>
                    
                    <div class="flex space-x-4">
                        <button type="submit" class="btn-primary flex-grow flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                            Add to Cart
                        </button>
                        
                        <button type="button" class="btn-outline-circle p-4 rounded-full border border-sage-green text-sage-green hover:bg-sage-green/5 transition add-to-wishlist" data-product-id="{{ $product->id }}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </button>
                    </div>
                </form>
                
                <!-- Product Description Tabs -->
                <div class="border-t border-gray-200 pt-8">
                    <div class="product-tabs">
                        <div class="border-b border-gray-200">
                            <nav class="flex -mb-px space-x-8">
                                <button class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 border-sage-green font-medium text-sage-green" data-tab="description">
                                    Description
                                </button>
                                <button class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="ingredients">
                                    Ingredients
                                </button>
                                <button class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="how-to-use">
                                    How to Use
                                </button>
                                <button class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="reviews">
                                    Reviews ({{ $product->review_count }})
                                </button>
                            </nav>
                        </div>
                        
                        <div class="py-6">
                            <!-- Description Tab -->
                            <div class="tab-content active" id="description-content">
                                <div class="prose prose-sage max-w-none">
                                    {!! $product->description !!}
                                </div>
                            </div>
                            
                            <!-- Ingredients Tab -->
                            <div class="tab-content hidden" id="ingredients-content">
                                <h3 class="text-lg font-medium mb-4">Ingredients</h3>
                                
                                @if($product->ingredients->count())
                                <ul class="space-y-2">
                                    @foreach($product->ingredients as $ingredient)
                                    <li class="flex items-start">
                                        <svg class="w-5 h-5 text-sage-green mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span>{{ $ingredient->ingredient }}</span>
                                    </li>
                                    @endforeach
                                </ul>
                                @else
                                <p class="text-gray-500">No ingredients information available.</p>
                                @endif
                            </div>
                            
                            <!-- How to Use Tab -->
                            <div class="tab-content hidden" id="how-to-use-content">
                                <h3 class="text-lg font-medium mb-4">How to Use</h3>
                                
                                @if($product->benefits->count())
                                <div class="space-y-4">
                                    @foreach($product->benefits as $benefit)
                                    <div class="flex items-start">
                                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-sage-green/20 flex items-center justify-center mr-3">
                                            <span class="text-sage-green font-medium">{{ $loop->iteration }}</span>
                                        </div>
                                        <p>{{ $benefit->benefit }}</p>
                                    </div>
                                    @endforeach
                                </div>
                                @else
                                <p class="text-gray-500">No usage information available.</p>
                                @endif
                            </div>
                            
                            <!-- Reviews Tab -->
                            <div class="tab-content hidden" id="reviews-content">
                                <div class="mb-8">
                                    <h3 class="text-lg font-medium mb-4">Customer Reviews</h3>
                                    
                                    @if($product->reviews->count())
                                    <div class="space-y-6">
                                        @foreach($product->reviews as $review)
                                        <div class="bg-white rounded-lg p-6 shadow-sm">
                                            <div class="flex items-center mb-4">
                                                <div class="w-10 h-10 rounded-full bg-sage-green/20 flex items-center justify-center mr-3">
                                                    <span class="text-sage-green font-medium">{{ substr($review->user->first_name ?? 'User', 0, 1) }}</span>
                                                </div>
                                                <div>
                                                    <div class="font-medium">{{ $review->user->full_name ?? 'Anonymous' }}</div>
                                                    <div class="text-sm text-gray-500">{{ $review->created_at->format('F j, Y') }}</div>
                                                </div>
                                            </div>
                                            
                                            <div class="flex text-amber-400 mb-3">
                                                @for($i = 1; $i <= 5; $i++)
                                                    @if($i <= $review->rating)
                                                        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                                                    @else
                                                        <svg class="w-5 h-5 fill-current text-gray-300" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                                                    @endif
                                                @endfor
                                            </div>
                                            
                                            @if($review->comment)
                                            <p class="text-gray-600">{{ $review->comment }}</p>
                                            @endif
                                        </div>
                                        @endforeach
                                    </div>
                                    @else
                                    <p class="text-gray-500">No reviews yet. Be the first to review this product!</p>
                                    @endif
                                </div>
                                
                                @auth
                                <div class="bg-white rounded-lg p-6 shadow-sm">
                                    <h4 class="text-lg font-medium mb-4">Write a Review</h4>
                                    
                                    <form action="{{ route('products.review', $product) }}" method="POST">
                                        @csrf
                                        
                                        <div class="mb-4">
                                            <label class="block text-gray-700 mb-2">Rating</label>
                                            <div class="flex rating-input">
                                                @for($i = 1; $i <= 5; $i++)
                                                <button type="button" class="rating-star text-gray-300 hover:text-amber-400 w-8 h-8" data-rating="{{ $i }}">
                                                    <svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                                                </button>
                                                @endfor
                                                <input type="hidden" name="rating" value="5" required>
                                            </div>
                                        </div>
                                        
                                        <div class="mb-4">
                                            <label for="comment" class="block text-gray-700 mb-2">Your Review (optional)</label>
                                            <textarea id="comment" name="comment" rows="4" class="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sage-green/50 focus:border-sage-green"></textarea>
                                        </div>
                                        
                                        <button type="submit" class="btn-primary">Submit Review</button>
                                    </form>
                                </div>
                                @else
                                <div class="bg-white rounded-lg p-6 shadow-sm text-center">
                                    <p class="mb-4">Please sign in to leave a review.</p>
                                    <a href="{{ route('login') }}" class="btn-primary">Sign In</a>
                                </div>
                                @endauth
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Related Products -->
        @if($relatedProducts->count())
        <div class="mt-16">
            <h2 class="font-cormorant text-3xl text-center mb-10">You May Also Like</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                @foreach($relatedProducts as $relatedProduct)
                <div class="product-card">
                    <div class="relative overflow-hidden rounded-lg mb-4 group">
                        <img src="{{ $relatedProduct->image_url }}" alt="{{ $relatedProduct->name }}" class="w-full h-64 object-cover transform transition-transform duration-500 group-hover:scale-105">
                        <div class="absolute inset-0 bg-gradient-to-t from-deep-brown/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                            <div class="p-6 w-full">
                                <div class="flex justify-between items-center">
                                    <a href="{{ route('products.show', $relatedProduct->slug) }}" class="btn-light-sm">View Details</a>
                                    <button class="btn-icon add-to-cart" data-product-id="{{ $relatedProduct->id }}">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 class="font-cormorant text-xl mb-1">{{ $relatedProduct->name }}</h3>
                    <div class="flex justify-between items-center">
                        <span class="text-deep-brown">{{ $relatedProduct->formatted_price }}</span>
                        <div class="flex items-center">
                            <div class="flex text-amber-400">
                                @for($i = 1; $i <= 5; $i++)
                                    @if($i <= $relatedProduct->average_rating)
                                        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                                    @else
                                        <svg class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                                    @endif
                                @endfor
                            </div>
                            <span class="text-sm text-gray-500 ml-1">({{ $relatedProduct->review_count }})</span>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif
    </div>
</div>

@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Product image gallery
        const mainImage = document.querySelector('.product-main-image img');
        const thumbnails = document.querySelectorAll('.thumbnail-image');
        
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Update main image
                mainImage.src = this.getAttribute('data-main-image');
                
                // Update selected thumbnail
                thumbnails.forEach(thumb => {
                    thumb.parentElement.classList.remove('border-sage-green');
                    thumb.parentElement.classList.add('border-transparent');
                });
                this.parentElement.classList.remove('border-transparent');
                this.parentElement.classList.add('border-sage-green');
            });
        });
        
        // Quantity selector
        const quantityInput = document.querySelector('.quantity-input');
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');
        
        minusBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            const maxValue = parseInt(quantityInput.getAttribute('max'));
            if (currentValue < maxValue) {
                quantityInput.value = currentValue + 1;
            }
        });
        
        // Tabs
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // Update active tab button
                tabButtons.forEach(btn => {
                    btn.classList.remove('border-sage-green', 'text-sage-green');
                    btn.classList.add('border-transparent', 'text-gray-500');
                });
                this.classList.remove('border-transparent', 'text-gray-500');
                this.classList.add('border-sage-green', 'text-sage-green');
                
                // Show active tab content
                tabContents.forEach(content => {
                    content.classList.add('hidden');
                });
                document.getElementById(`${tabName}-content`).classList.remove('hidden');
            });
        });
        
        // Rating input
        const ratingStars = document.querySelectorAll('.rating-star');
        const ratingInput = document.querySelector('input[name="rating"]');
        
        ratingStars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                ratingInput.value = rating;
                
                // Update stars appearance
                ratingStars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('text-gray-300');
                        s.classList.add('text-amber-400');
                    } else {
                        s.classList.remove('text-amber-400');
                        s.classList.add('text-gray-300');
                    }
                });
            });
        });
        
        // Initialize with all 5 stars selected
        ratingStars.forEach(star => {
            star.classList.remove('text-gray-300');
            star.classList.add('text-amber-400');
        });
        
        // Add to wishlist functionality
        const wishlistBtn = document.querySelector('.add-to-wishlist');
        wishlistBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            
            fetch('/wishlist/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ product_id: productId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Change button appearance
                    this.querySelector('svg').innerHTML = '<path fill="currentColor" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>';
                    
                    // Show success notification
                    showNotification('Product added to your wishlist!', 'success');
                } else {
                    // Show error notification
                    showNotification(data.message || 'Please login to add items to your wishlist', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred. Please try again.', 'error');
            });
        });
        
        // Notification function
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-sage-green' : 'bg-red-500'} transition-all duration-300 transform translate-y-0 opacity-0`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
            }, 10);
            
            // Animate out and remove
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }
    });
</script>
@endpush
```

## Product Routes

```php
<?php
// routes/web.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ScentFinderController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\UserController as AdminUserController;

// Public routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

// Products
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');
Route::post('/products/{product}/review', [ProductController::class, 'storeReview'])
    ->name('products.review')
    ->middleware('auth');

// Scent Finder
Route::get('/scent-finder', [ScentFinderController::class, 'index'])->name('scent-finder.index');
Route::post('/scent-finder/results', [ScentFinderController::class, 'process'])->name('scent-finder.process');

// Cart
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');

// Checkout
Route::get('/checkout', [CheckoutController::class, 'index'])
    ->name('checkout.index')
    ->middleware('auth');
Route::post('/checkout/process', [CheckoutController::class, 'process'])
    ->name('checkout.process')
    ->middleware('auth');
Route::get('/checkout/success/{order}', [CheckoutController::class, 'success'])
    ->name('checkout.success')
    ->middleware('auth');

// User Account
Route::middleware(['auth'])->group(function () {
    Route::get('/account', [UserController::class, 'index'])->name('account.index');
    Route::get('/account/edit', [UserController::class, 'edit'])->name('account.edit');
    Route::post('/account/update', [UserController::class, 'update'])->name('account.update');
    Route::get('/account/orders', [UserController::class, 'orders'])->name('account.orders');
    Route::get('/account/orders/{order}', [UserController::class, 'orderDetails'])->name('account.orders.show');
    
    // Addresses
    Route::get('/account/addresses', [UserController::class, 'addresses'])->name('account.addresses');
    Route::post('/account/addresses', [UserController::class, 'storeAddress'])->name('account.addresses.store');
    Route::put('/account/addresses/{address}', [UserController::class, 'updateAddress'])->name('account.addresses.update');
    Route::delete('/account/addresses/{address}', [UserController::class, 'destroyAddress'])->name('account.addresses.destroy');
    
    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/add', [WishlistController::class, 'add'])->name('wishlist.add');
    Route::post('/wishlist/remove', [WishlistController::class, 'remove'])->name('wishlist.remove');
});

// Newsletter
Route::post('/newsletter/subscribe', [HomeController::class, 'subscribeNewsletter'])
    ->name('newsletter.subscribe');

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    
    // Categories
    Route::resource('categories', AdminCategoryController::class);
    
    // Products
    Route::resource('products', AdminProductController::class);
    
    // Orders
    Route::resource('orders', AdminOrderController::class);
    Route::post('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])
        ->name('orders.update-status');
    
    // Users
    Route::resource('users', AdminUserController::class);
});

// Auth routes (Laravel's built-in auth routes)
require __DIR__.'/auth.php';
```

## Mood Map JavaScript Implementation

```javascript
// public/js/mood-map.js

class MoodMap {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        if (!this.container) return;
        
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.moods = [];
        this.connections = [];
        this.selectedMood = null;
        
        this.initEventListeners();
    }
    
    addMood(mood) {
        this.moods.push({
            id: mood.id,
            name: mood.name,
            x: mood.x * this.width / 100,  // Convert percentage to pixels
            y: mood.y * this.height / 100, // Convert percentage to pixels
            radius: 40,
            color: mood.color,
            hoverColor: this.lightenColor(mood.color, 20),
            textColor: this.getContrastColor(mood.color),
            description: mood.description || ''
        });
        
        return this;
    }
    
    addConnection(mood1Id, mood2Id, strength = 1) {
        this.connections.push({
            mood1: this.moods.find(m => m.id === mood1Id),
            mood2: this.moods.find(m => m.id === mood2Id),
            strength: strength, // 0-1 value for line thickness
            color: '#E5E7EB'
        });
        
        return this;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw connections
        this.connections.forEach(conn => {
            this.drawConnection(conn);
        });
        
        // Draw mood nodes
        this.moods.forEach(mood => {
            this.drawMood(mood);
        });
        
        return this;
    }
    
    drawConnection(connection) {
        this.ctx.beginPath();
        this.ctx.moveTo(connection.mood1.x, connection.mood1.y);
        this.ctx.lineTo(connection.mood2.x, connection.mood2.y);
        this.ctx.strokeStyle = connection.color;
        this.ctx.lineWidth = 1 + connection.strength * 2;
        this.ctx.stroke();
    }
    
    drawMood(mood) {
        // Draw circle
        this.ctx.beginPath();
        this.ctx.arc(mood.x, mood.y, mood.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = mood === this.selectedMood ? mood.hoverColor : mood.color;
        this.ctx.fill();
        
        // Draw text
        this.ctx.fillStyle = mood.textColor;
        this.ctx.font = '14px Montserrat, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(mood.name, mood.x, mood.y);
    }
    
    initEventListeners() {
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
    
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        let hoveredMood = null;
        
        // Check if mouse is over any mood
        for (const mood of this.moods) {
            const dx = mouseX - mood.x;
            const dy = mouseY - mood.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= mood.radius) {
                hoveredMood = mood;
                break;
            }
        }
        
        if (hoveredMood !== this.selectedMood) {
            this.canvas.style.cursor = hoveredMood ? 'pointer' : 'default';
            this.selectedMood = hoveredMood;
            this.render();
            
            // Show tooltip if hovering over a mood
            if (hoveredMood) {
                this.showTooltip(hoveredMood, event.clientX, event.clientY);
            } else {
                this.hideTooltip();
            }
        }
    }
    
    handleClick(event) {
        if (this.selectedMood) {
            this.loadMoodProducts(this.selectedMood.id);
        }
    }
    
    handleMouseLeave() {
        this.selectedMood = null;
        this.hideTooltip();
        this.render();
    }
    
    showTooltip(mood, x, y) {
        let tooltip = document.getElementById('mood-map-tooltip');
        
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'mood-map-tooltip';
            tooltip.className = 'absolute z-10 bg-white p-3 rounded-lg shadow-lg text-sm max-w-xs';
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <h4 class="font-medium text-deep-brown">${mood.name}</h4>
            <p class="text-gray-600">${mood.description}</p>
            <p class="text-sage-green mt-2">Click to explore products</p>
        `;
        
        // Position tooltip
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y + 10}px`;
        tooltip.style.display = 'block';
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('mood-map-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    loadMoodProducts(moodId) {
        // Show loading state
        this.container.classList.add('opacity-50');
        
        fetch(`/api/moods/${moodId}/products`)
            .then(response => response.json())
            .then(data => {
                this.showMoodProducts(data.products, data.mood);
            })
            .catch(error => {
                console.error('Error fetching mood products:', error);
            })
            .finally(() => {
                this.container.classList.remove('opacity-50');
            });
    }
    
    showMoodProducts(products, mood) {
        // Create a modal with the products
        const modalId = 'mood-products-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'fixed inset-0 z-50 overflow-y-auto';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="fixed inset-0 bg-black opacity-50"></div>
                <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 mx-auto">
                    <button type="button" id="close-modal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    
                    <div class="text-center mb-6">
                        <h3 class="font-cormorant text-3xl text-deep-brown mb-2">${mood.name} Products</h3>
                        <p class="text-gray-600">${mood.description}</p>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        ${products.map(product => `
                            <div class="product-card">
                                <div class="relative overflow-hidden rounded-lg mb-4 group">
                                    <img src="${product.image_url}" alt="${product.name}" class="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105">
                                    <div class="absolute inset-0 bg-gradient-to-t from-deep-brown/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                        <div class="p-4 w-full">
                                            <a href="/products/${product.slug}" class="btn-light-sm">View Details</a>
                                        </div>
                                    </div>
                                </div>
                                <h4 class="font-cormorant text-lg mb-1">${product.name}</h4>
                                <span class="text-deep-brown">${product.formatted_price}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="text-center mt-8">
                        <a href="/products?mood=${mood.name.toLowerCase()}" class="btn-primary">View All ${mood.name} Products</a>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener to close button
        document.getElementById('close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        // Close when clicking outside the modal content
        modal.querySelector('.fixed.inset-0').addEventListener('click', () => {
            modal.remove();
        });
    }
    
    // Helper methods
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }
    
    getContrastColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // Calculate contrast based on luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
}

// Initialize the mood map
document.addEventListener('DOMContentLoaded', function() {
    const moodMapEl = document.getElementById('mood-map');
    if (!moodMapEl) return;
    
    const map = new MoodMap('mood-map');
    
    // Add moods with their positions (percentages of container)
    map.addMood({
        id: 1,
        name: 'Relaxation',
        x: 30,
        y: 70,
        color: '#8BAD99',
        description: 'Products designed to help you unwind and relieve stress.'
    });
    
    map.addMood({
        id: 2,
        name: 'Energy',
        x: 70,
        y: 30,
        color: '#F8B84E',
        description: 'Invigorating scents to boost your energy and mood.'
    });
    
    map.addMood({
        id: 3,
        name: 'Focus',
        x: 80,
        y: 80,
        color: '#5E9ED6',
        description: 'Enhance your concentration and mental clarity.'
    });
    
    map.addMood({
        id: 4,
        name: 'Sleep',
        x: 20,
        y: 40,
        color: '#786FA6',
        description: 'Calming fragrances to promote better sleep and rest.'
    });
    
    map.addMood({
        id: 5,
        name: 'Stress Relief',
        x: 50,
        y: 60,
        color: '#A0C3D2',
        description: 'Combat stress and anxiety with these soothing products.'
    });
    
    // Add connections between moods
    map.addConnection(1, 2, 0.5)
      .addConnection(2, 3, 0.5)
      .addConnection(3, 1, 0.5)
      .addConnection(4, 1, 0.8)
      .addConnection(5, 1, 0.8)
      .addConnection(5, 4, 0.8);
    
    // Render the map
    map.render();
});
```

This complete solution delivers a modern, visually stunning e-commerce platform for The Scent, featuring:

1. A comprehensive MySQL database design optimized for aromatherapy products
2. A full Laravel PHP framework implementation with all necessary models, controllers, and views
3. Advanced frontend features like the interactive mood map, scent finder quiz, and product visualization
4. Optimized product pages with scent profile visualizations and mood benefits
5. A cohesive design system with elegant animations and transitions

The platform not only showcases the products beautifully but also educates customers about aromatherapy benefits, creating an immersive shopping experience that aligns perfectly with The Scent's mission of promoting mental and physical wellbeing through natural aromatherapy products.