import { apiFetch } from "./client";
import type {
  AdminCategory,
  AdminProduct,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types/api";

type AdminProductListResponse = { success: boolean; data: AdminProduct[] };
type AdminProductResponse = { success: boolean; data: AdminProduct };
type AdminCategoryListResponse = { success: boolean; data: AdminCategory[] };
type AdminCategoryResponse = { success: boolean; data: AdminCategory };

export const getAdminProducts = (
  token: string,
  params?: { category_id?: number; search?: string }
) => {
  const qs = new URLSearchParams();
  if (params?.category_id) qs.set("category_id", String(params.category_id));
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<AdminProductListResponse>(`/admin/products${query}`, { token });
};

export const getAdminProduct = (id: number, token: string) =>
  apiFetch<AdminProductResponse>(`/admin/products/${id}`, { token });

export const createProduct = (data: CreateProductPayload, token: string) =>
  apiFetch<AdminProductResponse>("/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });

export const updateProduct = (id: number, data: UpdateProductPayload, token: string) =>
  apiFetch<AdminProductResponse>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });

export const deleteProduct = (id: number, token: string) =>
  apiFetch<{ success: boolean }>(`/admin/products/${id}`, {
    method: "DELETE",
    token,
  });

export const toggleProduct = (id: number, token: string) =>
  apiFetch<AdminProductResponse>(`/admin/products/${id}/toggle`, {
    method: "POST",
    token,
  });

export const getAdminCategories = (token: string) =>
  apiFetch<AdminCategoryListResponse>("/admin/categories", { token });

export const createCategory = (
  data: { name: string; sort_order?: number; is_active?: boolean },
  token: string
) =>
  apiFetch<AdminCategoryResponse>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });

export const updateCategory = (
  id: number,
  data: { name?: string; sort_order?: number; is_active?: boolean },
  token: string
) =>
  apiFetch<AdminCategoryResponse>(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });

export const deleteCategory = (id: number, token: string) =>
  apiFetch<{ success: boolean }>(`/admin/categories/${id}`, {
    method: "DELETE",
    token,
  });
