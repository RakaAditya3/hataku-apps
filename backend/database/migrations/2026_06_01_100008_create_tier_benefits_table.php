<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tier_benefits', function (Blueprint $table) {
            $table->increments('id');
            $table->enum('tier', ['bamboo', 'jade', 'imperial', 'dragon']);
            $table->enum('benefit_type', ['point_bonus', 'weekly_voucher', 'monthly_voucher', 'other']);
            $table->unsignedInteger('bonus_percent')->nullable();
            $table->unsignedInteger('voucher_value')->nullable();
            $table->enum('voucher_type', ['fixed', 'percent'])->nullable();
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tier_benefits');
    }
};
