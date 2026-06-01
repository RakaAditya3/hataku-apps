<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('option_groups', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50);
            $table->boolean('is_required')->default(true);
            $table->unsignedTinyInteger('min_select')->default(1);
            $table->unsignedTinyInteger('max_select')->default(1);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('option_groups');
    }
};
