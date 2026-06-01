<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('order_code', 20)->unique();
            $table->enum('order_type', ['dine_in', 'takeaway']);
            $table->enum('status', ['pending', 'paid', 'in_progress', 'done', 'cancelled', 'expired'])->default('pending');

            // Pricing
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('discount_amount')->default(0);
            $table->unsignedInteger('points_redeemed')->default(0);
            $table->unsignedInteger('points_value')->default(0);
            $table->unsignedInteger('reward_id')->nullable();
            $table->unsignedInteger('reward_discount')->default(0);
            $table->unsignedInteger('total');

            // Loyalty outcome
            $table->unsignedInteger('points_earned')->nullable();
            $table->boolean('is_valid_transaction')->default(false);

            $table->string('promo_code_used', 50)->nullable();

            // Lifecycle timestamps
            $table->timestamp('expires_at');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('done_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            $table->foreign('reward_id')->references('id')->on('rewards')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
