import { apiFetch } from "./client";
import type { ApiResponse } from "./auth";
import type { Category, Product } from "@/types/api";

export const getCategories = () =>
  apiFetch<ApiResponse<Category[]>>("/categories");

export const getProducts = (categoryId?: number) => {
  const params = categoryId ? `?category_id=${categoryId}` : "";
  return apiFetch<ApiResponse<Product[]>>(`/products${params}`);
};

export const getProduct = (id: number) =>
  apiFetch<ApiResponse<Product>>(`/products/${id}`);
