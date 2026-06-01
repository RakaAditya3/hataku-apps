import { apiFetch } from "./client";
import type { AdminCustomer, AdminCustomerDetail } from "@/types/api";

type AdminCustomerListResponse = {
  success: boolean;
  data: AdminCustomer[];
  meta: { current_page: number; last_page: number; total: number };
};

type AdminCustomerDetailResponse = {
  success: boolean;
  data: AdminCustomerDetail;
};

export const getAdminCustomers = (
  token: string,
  params?: { search?: string; tier?: string; page?: number }
) => {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.tier) qs.set("tier", params.tier);
  if (params?.page) qs.set("page", String(params.page));
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<AdminCustomerListResponse>(`/admin/customers${query}`, { token });
};

export const getAdminCustomer = (id: number, token: string) =>
  apiFetch<AdminCustomerDetailResponse>(`/admin/customers/${id}`, { token });
