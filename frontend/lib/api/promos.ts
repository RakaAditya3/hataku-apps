import { apiFetch } from "./client";

export type Promo = {
  id: number;
  title: string;
  description: string | null;
  banner_url: string | null;
  code: string | null;
  discount_type: "fixed" | "percent";
  discount_value: number;
  min_purchase: number;
  valid_until: string;
  is_active: boolean;
};

export type AdminPromo = Promo & {
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  created_at: string;
};

export type PromoValidateResult = {
  code: string;
  title: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  discount_amount: number;
};

type ApiResponse<T> = { success: boolean; data: T };

export const getPromos = () =>
  apiFetch<ApiResponse<Promo[]>>("/promos");

export const validatePromo = (code: string, subtotal: number) =>
  apiFetch<ApiResponse<PromoValidateResult>>("/promos/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });

// Admin
export const getAdminPromos = (token: string) =>
  apiFetch<ApiResponse<AdminPromo[]>>("/admin/promos", { token });

export const createAdminPromo = (data: Partial<AdminPromo>, token: string) =>
  apiFetch<ApiResponse<AdminPromo>>("/admin/promos", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });

export const updateAdminPromo = (id: number, data: Partial<AdminPromo>, token: string) =>
  apiFetch<ApiResponse<AdminPromo>>(`/admin/promos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });

export const deleteAdminPromo = (id: number, token: string) =>
  apiFetch<{ success: boolean; message: string }>(`/admin/promos/${id}`, {
    method: "DELETE",
    token,
  });
