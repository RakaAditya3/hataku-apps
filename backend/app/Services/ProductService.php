<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductOptionGroup;
use Illuminate\Support\Facades\DB;

class ProductService
{
    private const SAUS_GROUP_ID = 1;

    public function create(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = Product::create([
                'category_id'  => $data['category_id'],
                'name'         => $data['name'],
                'description'  => $data['description'] ?? null,
                'price'        => $data['price'],
                'photo_url'    => $data['photo_url'] ?? null,
                'is_available' => $data['is_available'] ?? true,
                'sort_order'   => $data['sort_order'] ?? 0,
            ]);

            $this->syncOptionGroups($product, $data);

            return $product->load(['category', 'optionGroupsWithPivot.items']);
        });
    }

    public function update(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $fillable = ['category_id', 'name', 'description', 'price', 'photo_url', 'is_available', 'sort_order'];
            $updateData = [];
            foreach ($fillable as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                }
            }
            if (!empty($updateData)) {
                $product->update($updateData);
            }

            if (array_key_exists('option_group_ids', $data)) {
                $this->syncOptionGroups($product, $data);
            }

            return $product->load(['category', 'optionGroupsWithPivot.items']);
        });
    }

    public function softDelete(Product $product): void
    {
        $product->update(['is_deleted' => true, 'is_available' => false]);
    }

    public function toggle(Product $product): Product
    {
        $product->update(['is_available' => !$product->is_available]);
        return $product->fresh(['category', 'optionGroupsWithPivot.items']);
    }

    private function syncOptionGroups(Product $product, array $data): void
    {
        $groupIds = collect($data['option_group_ids'] ?? [])
            ->push(self::SAUS_GROUP_ID)
            ->unique()
            ->values();

        $overrides = collect($data['option_group_overrides'] ?? [])
            ->keyBy('option_group_id');

        ProductOptionGroup::where('product_id', $product->id)->delete();

        foreach ($groupIds as $groupId) {
            $override = $overrides->get($groupId);
            ProductOptionGroup::create([
                'product_id'      => $product->id,
                'option_group_id' => $groupId,
                'min_select'      => $override['min_select'] ?? null,
                'max_select'      => $override['max_select'] ?? null,
            ]);
        }
    }
}
