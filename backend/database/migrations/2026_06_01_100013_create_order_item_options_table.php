<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_item_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('option_group_id');
            $table->unsignedInteger('option_item_id');

            // Snapshot field — NEVER update after insert
            $table->string('option_name', 100);

            $table->timestamp('created_at')->useCurrent();

            $table->foreign('option_group_id')->references('id')->on('option_groups')->cascadeOnDelete();
            $table->foreign('option_item_id')->references('id')->on('option_items')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_item_options');
    }
};
