<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 100)->unique();
            $table->string('phone', 20)->nullable();
            $table->string('google_id', 100)->unique()->nullable();
            $table->string('avatar_url')->nullable();

            // Loyalty
            $table->unsignedInteger('point_balance')->default(0);
            $table->unsignedInteger('point_reserved')->default(0);
            $table->enum('tier', ['bamboo', 'jade', 'imperial', 'dragon'])->default('bamboo');
            $table->unsignedInteger('valid_transaction_count')->default(0);

            // Daily streak
            $table->unsignedTinyInteger('current_streak')->default(0);
            $table->date('last_checkin_date')->nullable();
            $table->date('streak_started_at')->nullable();

            // Referral (Phase 2)
            $table->string('referral_code', 20)->unique()->nullable();
            $table->foreignId('referred_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('referral_bonus_given')->default(false);

            // Tier benefit tracking
            $table->date('last_weekly_voucher_at')->nullable();
            $table->date('last_monthly_voucher_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
