import { apiFetch } from "./client";
import type { AdminUser, Order } from "@/types/api";

type AdminLoginResponse = {
  success: boolean;
  data: { admin: AdminUser; token: string };
};

type AdminOrderListResponse = {
  success: boolean;
  data: Order[];
  meta: { current_page: number; last_page: number; total: number };
};

type AdminOrderResponse = {
  success: boolean;
  data: Order;
};

export const adminLogin = (email: string, password: string) =>
  apiFetch<AdminLoginResponse>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const adminLogout = (token: string) =>
  apiFetch<{ success: boolean }>("/admin/logout", {
    method: "POST",
    token,
  });

export const getAdminMe = (token: string) =>
  apiFetch<{ success: boolean; data: AdminUser }>("/admin/me", { token });

export const getAdminOrders = (token: string, status?: string) => {
  const params = status ? `?status=${status}` : "";
  return apiFetch<AdminOrderListResponse>(`/admin/orders${params}`, { token });
};

export const getAdminOrder = (code: string, token: string) =>
  apiFetch<AdminOrderResponse>(`/admin/orders/${code}`, { token });

export const scanOrder = (code: string, token: string) =>
  apiFetch<AdminOrderResponse>(`/admin/orders/${code}/scan`, {
    method: "POST",
    token,
  });

export const markOrderDone = (code: string, token: string) =>
  apiFetch<AdminOrderResponse>(`/admin/orders/${code}/done`, {
    method: "POST",
    token,
  });

export const adminCancelOrder = (code: string, token: string) =>
  apiFetch<AdminOrderResponse>(`/admin/orders/${code}/cancel`, {
    method: "POST",
    token,
  });
