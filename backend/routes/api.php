<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminCustomerController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AdminPromoController;
use App\Http\Controllers\Api\AdminRewardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckinController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PointController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PromoController;
use App\Http\Controllers\Api\RewardController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

// Public catalog
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Public promos
Route::get('/promos', [PromoController::class, 'index']);
Route::post('/promos/validate', [PromoController::class, 'validate']);

// Public rewards catalog
Route::get('/rewards', [RewardController::class, 'index']);
Route::get('/rewards/{id}', [RewardController::class, 'show']);

// Customer auth
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/me', [AuthController::class, 'me']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // Orders
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{code}', [OrderController::class, 'show']);
    Route::delete('/orders/{code}', [OrderController::class, 'cancel']);

    // Check-in
    Route::post('/checkin', [CheckinController::class, 'checkin']);
    Route::get('/checkin/status', [CheckinController::class, 'status']);

    // Points history
    Route::get('/points/history', [PointController::class, 'history']);
});

// Admin
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', AdminMiddleware::class])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/me', [AdminAuthController::class, 'me']);

        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{code}', [AdminOrderController::class, 'show']);
        Route::post('/orders/{code}/scan', [AdminOrderController::class, 'scan']);
        Route::post('/orders/{code}/done', [AdminOrderController::class, 'done']);
        Route::post('/orders/{code}/cancel', [AdminOrderController::class, 'cancel']);

        // Products
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::get('/products/{id}', [AdminProductController::class, 'show']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
        Route::post('/products/{id}/toggle', [AdminProductController::class, 'toggle']);

        // Customers
        Route::get('/customers', [AdminCustomerController::class, 'index']);
        Route::get('/customers/{id}', [AdminCustomerController::class, 'show']);

        // Categories
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

        // Rewards
        Route::get('/rewards', [AdminRewardController::class, 'index']);
        Route::post('/rewards', [AdminRewardController::class, 'store']);
        Route::put('/rewards/{id}', [AdminRewardController::class, 'update']);
        Route::delete('/rewards/{id}', [AdminRewardController::class, 'destroy']);

        // Promos
        Route::get('/promos', [AdminPromoController::class, 'index']);
        Route::post('/promos', [AdminPromoController::class, 'store']);
        Route::put('/promos/{id}', [AdminPromoController::class, 'update']);
        Route::delete('/promos/{id}', [AdminPromoController::class, 'destroy']);
    });
});
